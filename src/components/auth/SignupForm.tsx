"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AUTH_RETURN_FLASH_KEY, setMockSession } from "@/lib/mock-auth";
import { safeReturnPath } from "@/lib/return-to";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeReturnPath(searchParams.get("returnTo"), "/");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = displayName.trim();
    if (name.length < 2) {
      setError("Choose a public display name (at least 2 characters).");
      return;
    }
    setError("");
    setMockSession(name);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(AUTH_RETURN_FLASH_KEY, "1");
    }
    router.push(returnTo);
    router.refresh();
  }

  return (
    <div className="bg-slate-50 py-14">
      <Container className="max-w-md">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your profile</h1>
        <p className="mt-2 text-sm text-slate-600">
          Demo signup—no email verification yet.{" "}
          <span className="font-medium text-slate-700">[Placeholder]</span> You will agree to
          terms of service here when legal copy exists.
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
            {error ? (
              <p id="signup-error" className="mt-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
          </div>
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
          <Button type="submit" variant="primary" className="w-full justify-center py-3">
            Create profile & continue
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
