"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { startTransition, useCallback, useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SIGNUP_PENDING_EMAIL_KEY } from "@/lib/signup-pending-email";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { safeReturnPath } from "@/lib/return-to";

export function SignupCheckEmailView() {
  const searchParams = useSearchParams();
  const returnTo = safeReturnPath(searchParams.get("returnTo"), "/");
  const [email, setEmail] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [showEmail, setShowEmail] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.sessionStorage.getItem(SIGNUP_PENDING_EMAIL_KEY);
    startTransition(() => setEmail(stored));
  }, []);

  const onResend = useCallback(async () => {
    const target = email ?? (typeof window !== "undefined" ? sessionStorage.getItem(SIGNUP_PENDING_EMAIL_KEY) : null);
    if (!target?.includes("@")) {
      setResendState("error");
      setResendMessage("We could not find the email you used. Go back to sign up and try again.");
      return;
    }
    setResendState("sending");
    setResendMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: target,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnTo)}`,
        },
      });
      if (error) {
        setResendState("error");
        setResendMessage(error.message);
        return;
      }
      setResendState("sent");
      setResendMessage("If an account exists for that address, we sent another confirmation email.");
    } catch {
      setResendState("error");
      setResendMessage("Something went wrong. Try again in a minute.");
    }
  }, [email, returnTo]);

  return (
    <div className="bg-slate-50 py-14 sm:py-16">
      <Container className="max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200/80">
          <div className="flex justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
              <Mail className="h-7 w-7" aria-hidden />
            </span>
          </div>
          <h1 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">
            Check your email
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
            We sent a <strong className="text-slate-900">verification link</strong> to the address you
            used. Open that email and tap the link to confirm your account. After that, you can sign in
            and continue where you left off.
          </p>
          <p className="mt-4 text-center text-xs text-slate-500">
            For privacy, we don&apos;t show your email on this screen unless you ask.
          </p>
          {email ? (
            <div className="mt-4 flex flex-col items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="compact"
                className="justify-center"
                onClick={() => setShowEmail((v) => !v)}
                aria-expanded={showEmail}
                aria-controls="signup-pending-email-display"
              >
                {showEmail ? "Hide email address" : "Display email address"}
              </Button>
              {showEmail ? (
                <output
                  id="signup-pending-email-display"
                  className="w-full max-w-sm rounded-xl bg-slate-50 px-4 py-3 text-center font-mono text-sm text-slate-900 ring-1 ring-slate-200/80"
                  aria-live="polite"
                >
                  {email}
                </output>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-center text-xs text-slate-500">
              Check the inbox for the account you just created.
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <Button type="button" variant="secondary" className="justify-center" onClick={() => void onResend()}>
              {resendState === "sending" ? "Sending…" : "Resend confirmation email"}
            </Button>
            {resendMessage ? (
              <p
                className={`text-center text-sm ${resendState === "error" ? "text-red-600" : "text-slate-600"}`}
                role="status"
              >
                {resendMessage}
              </p>
            ) : null}
          </div>

          <p className="mt-8 text-center text-sm text-slate-600">
            Already verified?{" "}
            <Link
              href={`/login?returnTo=${encodeURIComponent(returnTo)}`}
              className="font-semibold text-indigo-700 hover:text-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Log in
            </Link>
          </p>
          <p className="mt-3 text-center text-sm">
            <Link href="/" className="font-semibold text-slate-600 hover:text-slate-900">
              Back to home
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
