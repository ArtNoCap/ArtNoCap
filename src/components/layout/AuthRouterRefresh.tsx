"use client";

import { useRouter } from "next/navigation";
import { startTransition, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * Keeps server-rendered UI (e.g. header user menu) in sync after sign-in/out or
 * when the session is restored on the client.
 */
export function AuthRouterRefresh() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === "INITIAL_SESSION" ||
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "USER_UPDATED"
      ) {
        startTransition(() => router.refresh());
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return null;
}
