import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";

function UpdatePasswordFallback() {
  return (
    <div className="bg-slate-50 py-14">
      <Container className="max-w-md">
        <p className="text-sm text-slate-600">Loading…</p>
      </Container>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<UpdatePasswordFallback />}>
      <UpdatePasswordForm />
    </Suspense>
  );
}
