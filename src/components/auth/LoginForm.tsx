"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AUTH_RETURN_FLASH_KEY } from "@/lib/auth-flash";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { safeReturnPath } from "@/lib/return-to";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeReturnPath(searchParams.get("returnTo"), "/");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const e164 = email.trim().toLowerCase();
    if (!e164 || !e164.includes("@")) {
      setError("Enter a valid email.");
      return;
    }
    if (password.length < 8) {
      setError("Enter your password (at least 8 characters).");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signError } = await supabase.auth.signInWithPassword({ email: e164, password });
      if (signError) {
        setError(signError.message);
        return;
      }
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(AUTH_RETURN_FLASH_KEY, "1");
      }
      router.push(returnTo);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-slate-50 py-14">
      <Container className="max-w-md">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Log in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in with Supabase Auth (email + password). If you haven’t created an account yet, use{" "}
          <span className="font-semibold text-slate-900">Create a profile</span>.
        </p>
        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-900">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-900">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>

          {error ? (
            <p id="login-error" className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" variant="primary" size="lg" className="w-full justify-center" disabled={busy}>
            {busy ? "Signing in…" : "Continue"}
          </Button>
          <p className="text-center text-xs text-slate-500">
            New here?{" "}
            <a
              href={`/signup?returnTo=${encodeURIComponent(returnTo)}`}
              className="font-semibold text-indigo-700 hover:text-indigo-800"
            >
              Create a profile
            </a>
          </p>
        </form>
      </Container>
    </div>
  );
}
