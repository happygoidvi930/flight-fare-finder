import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, Logo } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flight Price Notifier — 機票降價通知 | Taipei fare alerts" },
      {
        name: "description",
        content:
          "設定航線及目標價，機票降價就通知你。Set a route and a target price — we email you when the cheapest fare from Taipei drops to or below your budget.",
      },
      { property: "og:title", content: "Flight Price Notifier — 機票降價通知" },
      {
        property: "og:description",
        content: "Set a route and a target price from Taipei — we email you when the fare drops.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const STEPS = [
  {
    n: "01",
    title: "選航線 / Pick a route",
    body: "從台北出發，選你想去的地方 — 東京、曼谷、新加坡、沖繩… 不確定日期也沒關係。",
  },
  {
    n: "02",
    title: "設目標價 / Set a target price",
    body: "輸入你願意下手的價格，例如「NT$6,000 以下通知我」。我們盯著該航線的每一張票。",
  },
  {
    n: "03",
    title: "收降價信 / Get the email",
    body: "最低票價一達到你的目標價，立刻寄信通知你，附上日期與訂票連結。",
  },
];

const SAMPLE_WATCHES = [
  { route: "Taipei → Tokyo", zh: "東京", target: "TWD 6,000", low: "TWD 5,820", status: "HIT" },
  { route: "Taipei → Singapore", zh: "新加坡", target: "TWD 5,200", low: "TWD 4,890", status: "HIT" },
  { route: "Taipei → Bangkok", zh: "曼谷", target: "TWD 4,000", low: "TWD 4,350", status: "WATCHING" },
  { route: "Taipei → San Francisco", zh: "舊金山", target: "TWD 22,000", low: "TWD 23,150", status: "WATCHING" },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-grid-faint opacity-50" />
        <div className="relative mx-auto grid max-w-[1200px] gap-12 px-6 py-20 lg:grid-cols-12 lg:py-28">
          <div className="lg:col-span-7">
            <div className="mb-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              Live fare monitoring · Taipei
            </div>
            <h1 className="font-display text-[46px] font-bold leading-[1.02] tracking-tight lg:text-[64px]">
              Flight Price
              <br />
              Notifier
            </h1>
            <p className="mt-6 font-display text-2xl font-medium leading-snug lg:text-[28px]">
              設定航線及目標價，<span className="text-primary">機票降價就通知你</span>
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Set a route and a target price — we email you the moment the fare drops to or below
              your budget. No exact dates required; you just want a ticket under a number.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Start monitoring <span className="font-mono text-xs">→</span>
              </Link>
              <a
                href="#watchlist"
                className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 font-display text-sm font-medium text-foreground transition-colors hover:border-muted-foreground"
              >
                See a live alert
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground/60">
              <span>128 routes watched</span>
              <span>~4 min alert latency</span>
              <span>No install</span>
            </div>
          </div>

          {/* Live alert card */}
          <div className="lg:col-span-5">
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Live alert
                </span>
                <span className="font-mono text-[11px] text-muted-foreground/60">TPE → NRT</span>
              </div>
              <div className="py-5">
                <div className="flex items-center gap-3">
                  <span className="font-display text-4xl font-bold">NT$5,820</span>
                  <span className="font-mono text-sm text-muted-foreground line-through">
                    NT$7,400
                  </span>
                  <span className="ml-auto rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[11px] text-primary">
                    ▼ 21%
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Dropped to your <span className="text-foreground">NT$6,000</span> target. Cheapest
                  found on <span className="text-foreground">Tue 14 Oct</span> · 2 onward dates
                  available.
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="font-mono text-[11px] text-muted-foreground/60">
                  watched since 02 Aug
                </span>
                <Link
                  to="/auth"
                  className="rounded-[5px] bg-primary px-3 py-1.5 font-display text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  View fare
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-b border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="flex items-end justify-between border-b border-border pb-5">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                01 — Workflow
              </span>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
                設好目標價，我們 24 小時盯著票價。
              </h2>
            </div>
            <span className="hidden font-mono text-[11px] text-muted-foreground/60 sm:block">
              3 steps
            </span>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n} className="rounded-lg border border-border bg-card p-6">
                <span className="font-mono text-sm text-primary">{step.n}</span>
                <h3 className="mt-4 font-display text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Watchlist preview */}
      <section id="watchlist" className="border-b border-border">
        <div className="mx-auto grid max-w-[1200px] items-start gap-10 px-6 py-16 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              02 — Watchlist
            </span>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
              你的監控清單，一目了然
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A quiet, data-first dashboard. Every route, its current cheapest fare, and how far it
              sits from your target price.
            </p>
            <Link
              to="/auth"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Sign in / 登入 <span className="font-mono text-xs">→</span>
            </Link>
          </div>
          <div className="lg:col-span-9" id="routes">
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-primary" /> My watchlist
                </div>
                <span className="font-mono text-[11px] text-muted-foreground/60">
                  Sample data · Sign in to see yours
                </span>
              </div>
              <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr] gap-4 border-b border-border px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60 md:grid">
                <span>Route</span>
                <span>Target</span>
                <span>Current low</span>
                <span className="text-right">Status</span>
              </div>
              {SAMPLE_WATCHES.map((w, i) => (
                <div
                  key={w.route}
                  className={`grid grid-cols-2 items-center gap-x-4 gap-y-2 px-5 py-4 md:grid-cols-[1.4fr_1fr_1fr_1fr] ${
                    i < SAMPLE_WATCHES.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <span className="font-display text-sm font-medium">
                    {w.route} <span className="text-xs text-muted-foreground/60">{w.zh}</span>
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{w.target}</span>
                  <span className="font-mono text-xs text-foreground">{w.low}</span>
                  <span
                    className={`justify-self-end rounded-full px-2.5 py-1 font-mono text-[11px] ${
                      w.status === "HIT"
                        ? "border border-primary/30 bg-primary/10 text-primary"
                        : "border border-border text-muted-foreground"
                    }`}
                  >
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-4 px-6 py-10 sm:flex-row sm:items-center">
          <Logo small />
          <p className="font-mono text-[11px] text-muted-foreground/60">
            © 2026 Flight Price Notifier · 價格僅供參考，以訂票頁為準
          </p>
        </div>
      </footer>
    </div>
  );
}
