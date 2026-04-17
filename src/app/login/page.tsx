import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to ArtNoCap (demo auth — Supabase later).",
};

function LoginFallback() {
  return (
    <div className="bg-slate-50 py-14">
      <Container className="max-w-md">
        <p className="text-sm text-slate-600">Loading…</p>
      </Container>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
