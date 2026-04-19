import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Request a secure link to reset your ArtNoCap password.",
};

function ForgotFallback() {
  return (
    <div className="bg-slate-50 py-14">
      <Container className="max-w-md">
        <p className="text-sm text-slate-600">Loading…</p>
      </Container>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotFallback />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
