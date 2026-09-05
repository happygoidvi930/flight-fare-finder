import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/SiteHeader";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in / 登入 — Flight Price Notifier" },
      {
        name: "description",
        content: "Sign in to Flight Price Notifier to set route alerts and get fare drop emails.",
      },
      { property: "og:title", content: "Sign in — Flight Price Notifier" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/watches", replace: true });
    });
  }, [navigate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/watches", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice("註冊成功！請到信箱點擊確認連結後再登入。Check your email to confirm, then sign in.");
          setMode("signin");
        } else {
          navigate({ to: "/watches", replace: true });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message ?? "Google sign-in failed");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-grid-faint opacity-50" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link to="/" aria-label="Back to home">
            <Logo />
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            {mode === "signin" ? "Sign in / 登入" : "Create account / 註冊"}
          </div>

          <form onSubmit={handleEmail} className="space-y-4">
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Email / 電子郵件
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Password / 密碼
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
                {notice}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2.5 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? "…" : mode === "signin" ? "Sign in / 登入" : "Sign up / 註冊"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60">
              or
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            onClick={handleGoogle}
            className="w-full rounded-md border border-border px-4 py-2.5 font-display text-sm font-medium text-foreground transition-colors hover:border-muted-foreground"
          >
            Continue with Google
          </button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {mode === "signin" ? "還沒有帳號？" : "已經有帳號？"}{" "}
            <button
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setNotice(null);
              }}
              className="font-medium text-primary hover:underline"
            >
              {mode === "signin" ? "註冊 / Sign up" : "登入 / Sign in"}
            </button>
          </p>
        </div>
        <p className="mt-4 text-center font-mono text-[10px] text-muted-foreground/60">
          設定航線及目標價，機票降價就通知你
        </p>
      </div>
    </div>
  );
}
