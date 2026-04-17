import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function CtaBannerSection() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-6 py-12 shadow-lg sm:px-12 sm:py-14">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl"
            aria-hidden
          />
          <div className="relative max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Join thousands of creators, dreamers, and voters.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-indigo-100 sm:text-lg">
              Be part of a creative community that brings ideas to life—no payments, no ecommerce,
              just great artwork.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href="/signup?returnTo=%2F" variant="primary" className="px-6 py-3 text-base">
                Sign up for free
              </Button>
              <Button href="/login?returnTo=%2F" variant="outlineLight" className="px-6 py-3 text-base">
                Log in
              </Button>
            </div>
            <p className="mt-4 text-xs text-indigo-200">
              [Placeholder] Accounts will be powered by Supabase in a future milestone.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
