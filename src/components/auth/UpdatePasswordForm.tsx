"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AUTH_RETURN_FLASH_KEY } from "@/lib/auth-flash";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { safeReturnPath } from "@/lib/return-to";

export function UpdatePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeReturnPath(searchParams.get("returnTo"), "/");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getSession().then(({ data }) => {
      startTransition(() => {
        setSessionReady(true);
        setHasSession(Boolean(data.session));
      });
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) {
        setError(updErr.message);
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

  if (!sessionReady) {
    return (
      <div className="bg-slate-50 py-14">
        <Container className="max-w-md">
          <p className="text-sm text-slate-600" role="status">
            Checking your reset link…
          </p>
        </Container>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="bg-slate-50 py-14">
        <Container className="max-w-md">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Link expired or invalid</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            This password reset link is no longer valid. Request a new one and try again from the same browser.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Button href={`/forgot-password?returnTo=${encodeURIComponent(returnTo)}`} variant="primary" size="lg" className="justify-center">
              Request a new link
            </Button>
            <Button href={`/login?returnTo=${encodeURIComponent(returnTo)}`} variant="secondary" className="justify-center">
              Back to log in
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-14">
      <Container className="max-w-md">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Choose a new password</h1>
        <p className="mt-2 text-sm text-slate-600">Pick a strong password you haven&apos;t used elsewhere.</p>
        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80"
        >
          <div>
            <label htmlFor="new-password" className="block text-sm font-semibold text-slate-900">
              New password
            </label>
            <input
              id="new-password"
              name="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-semibold text-slate-900">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" variant="primary" size="lg" className="w-full justify-center" disabled={busy}>
            {busy ? "Updating…" : "Update password & continue"}
          </Button>
          <p className="text-center text-xs text-slate-500">
            <Link href={`/login?returnTo=${encodeURIComponent(returnTo)}`} className="font-semibold text-indigo-700 hover:text-indigo-800">
              Cancel and return to log in
            </Link>
          </p>
        </form>
      </Container>
    </div>
  );
}
