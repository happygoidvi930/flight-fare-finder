import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/_authenticated/watches")({
  head: () => ({
    meta: [
      { title: "My watchlist / 我的監控 — Flight Price Notifier" },
      { name: "description", content: "Your watched flight routes and target prices." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WatchesPage,
});

interface Watch {
  id: string;
  destination_code: string;
  destination_city_zh: string;
  destination_city_en: string;
  target_price_twd: number;
  current_low_twd: number | null;
  status: "watching" | "hit" | "sent";
  created_at: string;
}

const DESTINATIONS = [
  { code: "NRT", zh: "東京", en: "Tokyo (Narita)" },
  { code: "HND", zh: "東京", en: "Tokyo (Haneda)" },
  { code: "KIX", zh: "大阪", en: "Osaka" },
  { code: "OKA", zh: "沖繩", en: "Okinawa" },
  { code: "BKK", zh: "曼谷", en: "Bangkok" },
  { code: "SIN", zh: "新加坡", en: "Singapore" },
  { code: "HKG", zh: "香港", en: "Hong Kong" },
  { code: "ICN", zh: "首爾", en: "Seoul" },
  { code: "MNL", zh: "馬尼拉", en: "Manila" },
  { code: "SFO", zh: "舊金山", en: "San Francisco" },
];

function fmt(n: number | null) {
  return n == null ? "—" : `NT$${n.toLocaleString("en-US")}`;
}

function WatchesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [destCode, setDestCode] = useState(DESTINATIONS[0].code);
  const [target, setTarget] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: watches, isLoading } = useQuery({
    queryKey: ["watches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("watches")
        .select("id, destination_code, destination_city_zh, destination_city_en, target_price_twd, current_low_twd, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Watch[];
    },
  });

  async function addWatch(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const price = Number(target.replace(/[^\d]/g, ""));
    if (!price || price <= 0) {
      setFormError("請輸入有效的目標價 (TWD)");
      return;
    }
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate({ to: "/auth", replace: true });
        return;
      }
      const dest = DESTINATIONS.find((d) => d.code === destCode)!;
      const { error } = await supabase.from("watches").insert({
        user_id: userData.user.id,
        destination_code: dest.code,
        destination_city_zh: dest.zh,
        destination_city_en: dest.en,
        target_price_twd: price,
        status: "watching",
      });
      if (error) throw error;
      setTarget("");
      await queryClient.invalidateQueries({ queryKey: ["watches"] });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add watch");
    } finally {
      setSaving(false);
    }
  }

  async function removeWatch(id: string) {
    const { error } = await supabase.from("watches").delete().eq("id", id);
    if (!error) await queryClient.invalidateQueries({ queryKey: ["watches"] });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="flex items-end justify-between border-b border-border pb-5">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              Watchlist
            </span>
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">
              我的監控航線
            </h1>
          </div>
          <span className="hidden font-mono text-[11px] text-muted-foreground/60 sm:block">
            {watches?.length ?? 0} routes · TPE 出發
          </span>
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-12">
          {/* Watch list */}
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  <span className="size-1.5 animate-pulse rounded-full bg-primary" /> Monitoring
                </div>
                <span className="font-mono text-[11px] text-muted-foreground/60">
                  Auto-checked daily
                </span>
              </div>
              <div className="hidden grid-cols-[1.4fr_1fr_1fr_auto] gap-4 border-b border-border px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60 md:grid">
                <span>Route</span>
                <span>Target</span>
                <span>Current low</span>
                <span className="text-right">Status</span>
              </div>

              {isLoading ? (
                <p className="px-5 py-8 font-mono text-[11px] text-muted-foreground">Loading…</p>
              ) : !watches || watches.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="font-display text-sm font-medium">還沒有監控任何航線</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add your first route on the right — we'll email you when the fare hits your
                    target.
                  </p>
                </div>
              ) : (
                watches.map((w, i) => {
                  const hit =
                    w.current_low_twd != null && w.current_low_twd <= w.target_price_twd;
                  const status = hit ? "HIT" : w.status.toUpperCase();
                  return (
                    <div
                      key={w.id}
                      className={`group grid grid-cols-2 items-center gap-x-4 gap-y-2 px-5 py-4 md:grid-cols-[1.4fr_1fr_1fr_auto] ${
                        i < watches.length - 1 ? "border-b border-border" : ""
                      }`}
                    >
                      <span className="font-display text-sm font-medium">
                        TPE → {w.destination_code}{" "}
                        <span className="text-xs text-muted-foreground/60">
                          {w.destination_city_zh} {w.destination_city_en}
                        </span>
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {fmt(w.target_price_twd)}
                      </span>
                      <span className="font-mono text-xs text-foreground">
                        {fmt(w.current_low_twd)}
                      </span>
                      <span className="flex items-center gap-2 justify-self-end">
                        <span
                          className={`rounded-full px-2.5 py-1 font-mono text-[11px] ${
                            status === "HIT"
                              ? "border border-primary/30 bg-primary/10 text-primary"
                              : "border border-border text-muted-foreground"
                          }`}
                        >
                          {status}
                        </span>
                        <button
                          onClick={() => removeWatch(w.id)}
                          aria-label={`Remove watch TPE to ${w.destination_code}`}
                          className="font-mono text-[11px] text-muted-foreground/50 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            <p className="mt-3 font-mono text-[10px] text-muted-foreground/60">
              Fares are indicative samples until live fare sources are connected. Emails go to your
              sign-in address.
            </p>
          </div>

          {/* Add watch */}
          <div className="lg:col-span-4">
            <form
              onSubmit={addWatch}
              className="rounded-lg border border-border bg-card p-5"
            >
              <div className="mb-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                <span className="size-1.5 rounded-full bg-primary" /> Add watch / 新增監控
              </div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Destination / 目的地
              </label>
              <select
                value={destCode}
                onChange={(e) => setDestCode(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              >
                {DESTINATIONS.map((d) => (
                  <option key={d.code} value={d.code}>
                    TPE → {d.code} · {d.zh} {d.en}
                  </option>
                ))}
              </select>
              <label className="mb-1.5 mt-4 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Target price (TWD) / 目標價
              </label>
              <input
                inputMode="numeric"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="6,000"
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary"
              />
              {formError && (
                <p className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {formError}
                </p>
              )}
              <button
                type="submit"
                disabled={saving}
                className="mt-5 w-full rounded-md bg-primary px-4 py-2.5 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {saving ? "…" : "Watch this route / 開始監控"}
              </button>
              <p className="mt-3 text-center font-mono text-[10px] text-muted-foreground/60">
                降價達標時寄信通知你
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
