import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`${small ? "size-7" : "size-8"} grid place-items-center rounded-[5px] border border-primary/40 bg-primary/10`}
      >
        <span className="font-mono text-sm font-medium text-primary">⇄</span>
      </div>
      <span
        className={`${small ? "text-sm" : "text-[15px]"} font-display font-semibold tracking-tight text-foreground`}
      >
        Flight Price Notifier
      </span>
    </div>
  );
}

export function SiteHeader() {
  const [signedIn, setSignedIn] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Link to="/" aria-label="Flight Price Notifier home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-7 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground md:flex">
          <a className="transition-colors hover:text-foreground" href="/#how">
            How it works
          </a>
          <a className="transition-colors hover:text-foreground" href="/#routes">
            Routes
          </a>
          <a className="transition-colors hover:text-foreground" href="/#watchlist">
            Watchlist
          </a>
        </nav>
        <div className="flex items-center gap-3">
          {signedIn ? (
            <>
              <Link
                to="/watches"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <span className="font-mono text-[11px]">航線</span> My watchlist
              </Link>
              <button
                onClick={handleSignOut}
                className="font-display text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Sign in / 登入
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
