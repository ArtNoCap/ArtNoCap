import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "@/components/auth/SignupForm";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Create profile",
  description: "Create an ArtNoCap profile (demo — Supabase later).",
};

function SignupFallback() {
  return (
    <div className="bg-slate-50 py-14">
      <Container className="max-w-md">
        <p className="text-sm text-slate-600">Loading…</p>
      </Container>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupForm />
    </Suspense>
  );
}
