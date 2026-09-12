import { createFileRoute } from "@tanstack/react-router";
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

const API_BASE = "https://vl4ocsoi9k.execute-api.us-east-1.amazonaws.com";

interface Subscription {
  email: string;
  route: string;
  plan_name: string;
  origin: string;
  destination: string;
  target_price: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

const PLANS = [
  {
    plan_name: "tokyo",
    zh: "台北 ✈ 東京",
    en: "Taipei → Tokyo",
    route: "TPE-TYO",
    hint: 9325,
  },
  {
    plan_name: "seoul",
    zh: "台北 ✈ 首爾",
    en: "Taipei → Seoul",
    route: "TPE-SEL",
    hint: 5989,
  },
] as const;

function fmt(n: number | null | undefined) {
  return n == null ? "—" : `NT$${n.toLocaleString("en-US")}`;
}

function WatchesPage() {
  const queryClient = useQueryClient();

  const { data: email } = useQuery({
    queryKey: ["auth-email"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.email?.toLowerCase() ?? null;
    },
  });

  const { data: subs, isLoading } = useQuery({
    queryKey: ["subscriptions", email],
    enabled: !!email,
    queryFn: async () => {
      const r = await fetch(
        `${API_BASE}/subscriptions?email=${encodeURIComponent(email as string)}`,
      );
      if (!r.ok) throw new Error(`API ${r.status}`);
      const body = (await r.json()) as { items: Subscription[] };
      return body.items;
    },
  });

  const subByRoute = new Map((subs ?? []).map((s) => [s.route, s]));

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
            {subs?.length ?? 0} / {PLANS.length} plans · TPE 出發 · 每 30 分鐘檢查
          </span>
        </div>

        {isLoading ? (
          <p className="mt-10 font-mono text-[11px] text-muted-foreground">Loading…</p>
        ) : (
          <div className="mt-8 grid items-start gap-6 md:grid-cols-2">
            {PLANS.map((p) => (
              <PlanCard
                key={p.plan_name}
                plan={p}
                email={email ?? null}
                sub={subByRoute.get(p.route)}
                onSaved={() =>
                  queryClient.invalidateQueries({ queryKey: ["subscriptions", email] })
                }
              />
            ))}
          </div>
        )}

        <p className="mt-6 font-mono text-[10px] text-muted-foreground/60">
          目標達成時會寄降價通知到你的登入信箱（{email ?? "…"}）。價格每 30 分鐘自動檢查一次。
        </p>
      </main>
    </div>
  );
}

function PlanCard({
  plan,
  email,
  sub,
  onSaved,
}: {
  plan: (typeof PLANS)[number];
  email: string | null;
  sub: Subscription | undefined;
  onSaved: () => void;
}) {
  const [target, setTarget] = useState("");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const subscribed = !!sub;
  const showForm = !subscribed || editing;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const price = Number(target.replace(/[^\d]/g, ""));
    if (!price || price <= 0) {
      setError("請輸入有效的目標價 (TWD)");
      return;
    }
    if (!email) {
      setError("尚未取得登入信箱，請重新整理");
      return;
    }
    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/subscribe`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, plan_name: plan.plan_name, target_price: price }),
      });
      if (!r.ok) {
        const body = (await r.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `API ${r.status}`);
      }
      setTarget("");
      setEditing(false);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "訂閱失敗，請再試一次");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">{plan.zh}</h2>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground/60">
            {plan.route} · {plan.en}
          </p>
        </div>
        {subscribed && (
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[11px] text-primary">
            已訂閱
          </span>
        )}
      </div>

      <p className="mt-4 font-mono text-[11px] text-muted-foreground">
        近期最低價約 {fmt(plan.hint)}（參考值）
      </p>

      {subscribed && (
        <div className="mt-4 rounded-md border border-border bg-background px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            目前目標價
          </p>
          <p className="mt-1 font-display text-xl font-semibold">
            {fmt(sub?.target_price)}
          </p>
        </div>
      )}

      {showForm ? (
        <form onSubmit={save} className="mt-4">
          <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Target price (TWD) / 目標價
          </label>
          <input
            inputMode="numeric"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={String(plan.hint + 500)}
            className="w-full rounded-md border border-input bg-background px-3 py-2.5 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary"
          />
          {error && (
            <p className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-md bg-primary px-4 py-2.5 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? "…" : subscribed ? "更新目標價" : "開始追蹤"}
            </button>
            {subscribed && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError(null);
                }}
                className="rounded-md border border-border px-4 py-2.5 font-display text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                取消
              </button>
            )}
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => {
            setEditing(true);
            setTarget(String(sub?.target_price ?? ""));
          }}
          className="mt-4 w-full rounded-md border border-border px-4 py-2.5 font-display text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          更新目標價
        </button>
      )}

      <p className="mt-3 text-center font-mono text-[10px] text-muted-foreground/60">
        降價達標時寄信通知你
      </p>
    </div>
  );
}
