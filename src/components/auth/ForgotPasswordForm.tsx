"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { safeReturnPath } from "@/lib/return-to";

function buildRecoveryRedirectTo(origin: string, returnTo: string) {
  const path = `/auth/update-password?returnTo=${encodeURIComponent(returnTo)}`;
  return `${origin}/auth/callback?next=${encodeURIComponent(path)}`;
}

export function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const returnTo = safeReturnPath(searchParams.get("returnTo"), "/");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const e164 = email.trim().toLowerCase();
    if (!e164 || !e164.includes("@")) {
      setError("Enter a valid email.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const origin = window.location.origin;
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(e164, {
        redirectTo: buildRecoveryRedirectTo(origin, returnTo),
      });
      if (resetErr) {
        setError(resetErr.message);
        return;
      }
      setSent(true);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="bg-slate-50 py-14">
        <Container className="max-w-md">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Check your email</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            If an account exists for that address, we sent a link to reset your password. It may take a
            minute to arrive. You can close this tab.
          </p>
          <p className="mt-6 text-sm text-slate-600">
            <Link href={`/login?returnTo=${encodeURIComponent(returnTo)}`} className="font-semibold text-indigo-700 hover:text-indigo-800">
              Back to log in
            </Link>
          </p>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-14">
      <Container className="max-w-md">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reset password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter the email you use for ArtNoCap. We&apos;ll send a secure link to choose a new password.
        </p>
        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80"
        >
          <div>
            <label htmlFor="forgot-email" className="block text-sm font-semibold text-slate-900">
              Email
            </label>
            <input
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "forgot-error" : undefined}
            />
          </div>
          {error ? (
            <p id="forgot-error" className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" variant="primary" size="lg" className="w-full justify-center" disabled={busy}>
            {busy ? "Sending link…" : "Send reset link"}
          </Button>
          <p className="text-center text-xs text-slate-500">
            Remembered it?{" "}
            <Link
              href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
              className="font-semibold text-indigo-700 hover:text-indigo-800"
            >
              Log in
            </Link>
          </p>
        </form>
      </Container>
    </div>
  );
}
