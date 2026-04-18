import { Brush, Monitor, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const cards = [
  {
    title: "I want artwork",
    description: "Post a project, receive custom submissions, and pick your favorite.",
    icon: Monitor,
    accent: "from-indigo-600 to-violet-600",
    ring: "ring-indigo-100",
    button: { href: "/projects/new" as const, label: "Start a Project", variant: "primary" as const },
  },
  {
    title: "I want to submit designs",
    description: "Browse open projects, upload your best work, and get votes and visibility.",
    icon: Brush,
    accent: "from-emerald-600 to-teal-600",
    ring: "ring-emerald-100",
    button: { href: "/browse" as const, label: "View Open Projects", variant: "accentGreen" as const },
  },
  {
    title: "I want to explore & vote",
    description: "Browse submissions, vote on favorites, and help surface the best designs.",
    icon: ThumbsUp,
    accent: "from-amber-500 to-orange-600",
    ring: "ring-amber-100",
    button: { href: "/browse" as const, label: "Browse Gallery", variant: "accentOrange" as const },
  },
];

export function AudienceSection() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Choose your way to get involved
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            Whether you are requesting, creating, or curating—there is a place for you.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className={`flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ${card.ring} ring-slate-200/80`}
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-white shadow-sm`}
                >
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{card.description}</p>
                <div className="mt-6">
                  <Button
                    href={card.button.href}
                    variant={card.button.variant}
                    size="lg"
                    className="w-full justify-center sm:w-auto"
                  >
                    {card.button.label}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
