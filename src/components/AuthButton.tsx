import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function AuthButton() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (!ready) {
    return <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">…</span>;
  }

  if (!user) {
    return (
      <Link
        to="/auth"
        className="rounded-sm bg-primary px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-[16ch] truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">
        {user.email}
      </span>
      <button
        onClick={handleSignOut}
        className="rounded-sm border border-border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground transition-colors hover:border-primary/50 hover:text-primary"
      >
        Sign out
      </button>
    </div>
  );
}
