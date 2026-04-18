"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AUTH_RETURN_FLASH_KEY } from "@/lib/auth-flash";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { safeReturnPath } from "@/lib/return-to";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeReturnPath(searchParams.get("returnTo"), "/");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = displayName.trim();
    if (name.length < 2) {
      setError("Choose a public display name (at least 2 characters).");
      return;
    }
    const e164 = email.trim().toLowerCase();
    if (!e164 || !e164.includes("@")) {
      setError("Enter a valid email.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email: e164,
        password,
        options: {
          data: { display_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnTo)}`,
        },
      });
      if (signUpError) {
        setError(signUpError.message);
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your profile</h1>
        <p className="mt-2 text-sm text-slate-600">
          Create an account with Supabase Auth (email + password). If email confirmation is enabled in
          your Supabase project, check your inbox after signing up.
        </p>
        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80"
        >
          <div>
            <label htmlFor="displayName" className="block text-sm font-semibold text-slate-900">
              Public display name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              autoComplete="nickname"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "signup-error" : undefined}
            />
          </div>

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-900">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {error ? (
            <p id="signup-error" className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-600">
            <input
              type="checkbox"
              required
              className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>
              <span className="font-semibold text-slate-900">[Placeholder]</span> I agree to future
              ArtNoCap terms and privacy policy (copy TBD).
            </span>
          </label>
          <Button type="submit" variant="primary" size="lg" className="w-full justify-center" disabled={busy}>
            {busy ? "Creating account…" : "Create profile & continue"}
          </Button>
          <p className="text-center text-xs text-slate-500">
            Already have a profile?{" "}
            <a
              href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
              className="font-semibold text-indigo-700 hover:text-indigo-800"
            >
              Log in
            </a>
          </p>
        </form>
      </Container>
    </div>
  );
}
