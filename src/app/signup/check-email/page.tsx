import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { SignupCheckEmailView } from "@/components/auth/SignupCheckEmailView";

function CheckEmailFallback() {
  return (
    <div className="bg-slate-50 py-14">
      <Container className="max-w-md">
        <p className="text-sm text-slate-600">Loading…</p>
      </Container>
    </div>
  );
}

export default function SignupCheckEmailPage() {
  return (
    <Suspense fallback={<CheckEmailFallback />}>
      <SignupCheckEmailView />
    </Suspense>
  );
}
