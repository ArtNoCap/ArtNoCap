import { ImageIcon, PencilLine, Trophy } from "lucide-react";
import { Container } from "@/components/ui/Container";

const steps = [
  {
    title: "Create your project",
    body: "Share your vision. Add details like size, style, colors, and keywords so creators know what “great” looks like.",
    icon: PencilLine,
  },
  {
    title: "Get submissions",
    body: "Artists and AI creators submit finished artwork. The community can vote to help favorites rise to the top.",
    icon: ImageIcon,
  },
  {
    title: "Choose your favorite",
    body: "Review the top submissions, pick the one you love, and move forward with confidence—no storefront required.",
    icon: Trophy,
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-slate-50 py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            How it works
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            Three simple steps from idea to your perfect artwork.
          </p>
        </div>
        <ol className="mt-12 grid gap-8 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-indigo-600">
                  Step {index + 1}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
