import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type CollagePhoto = {
  key: string;
  src: string;
  alt: string;
  className: string;
};

const collage: CollagePhoto[] = [
  {
    key: "mountain",
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=700&fit=crop",
    alt: "Mountain landscape artwork",
    className: "top-0 right-0 z-0 h-[46%] w-[58%]",
  },
  {
    key: "abstract",
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=700&fit=crop",
    alt: "Abstract wave pattern",
    className: "bottom-8 left-0 z-10 h-[42%] w-[52%]",
  },
  {
    key: "romantic-dinner",
    src: "/images/hero-romantic-dinner.png",
    alt: "Illustration of two people sharing a candlelit dinner on a balcony overlooking a city at night.",
    className: "top-[14%] left-[4%] z-30 h-[44%] w-[50%]",
  },
  {
    key: "space",
    src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=700&fit=crop",
    alt: "Futuristic space scene",
    className: "bottom-0 right-[6%] z-20 h-[44%] w-[56%]",
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/80 via-white to-white pb-16 pt-10 sm:pb-20 sm:pt-14">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl sm:leading-tight">
              Custom artwork made simple.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
              Post your idea, get amazing artwork submissions from our community, and choose your
              favorite.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href="/projects/new" variant="primary" size="lg">
                Start a Project
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              <Button href="/browse" variant="secondary" size="lg">
                Browse Projects
              </Button>
            </div>

            <dl className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-slate-200/80 shadow-sm backdrop-blur">
                <dt className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" aria-hidden />
                  Free to use
                </dt>
                <dd className="mt-1 text-xs leading-relaxed text-slate-600">
                  Always free. No fees.
                </dd>
              </div>
              <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-slate-200/80 shadow-sm backdrop-blur">
                <dt className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Sparkles className="h-4 w-4 text-indigo-600" aria-hidden />
                  Full usage rights
                </dt>
                <dd className="mt-1 text-xs leading-relaxed text-slate-600">
                  You keep and use it.{" "}
                  <Link
                    href="/legal/user-content-disclaimer"
                    className="font-semibold text-indigo-700 underline decoration-indigo-200 underline-offset-2 hover:text-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Read our draft disclaimer on uploads, voting, and risk
                  </Link>
                  .
                </dd>
              </div>
              <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-slate-200/80 shadow-sm backdrop-blur">
                <dt className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Users className="h-4 w-4 text-indigo-600" aria-hidden />
                  Community driven
                </dt>
                <dd className="mt-1 text-xs leading-relaxed text-slate-600">
                  Real people. Real votes.
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div
              className="relative aspect-square w-full max-w-md mx-auto lg:max-w-none rounded-[2rem] bg-gradient-to-br from-indigo-100 via-white to-slate-100 p-4 shadow-inner ring-1 ring-slate-200/80"
              aria-hidden
            >
              <div className="relative h-full w-full rounded-[1.5rem] bg-white/40">
                {collage.map((tile) => (
                  <div
                    key={tile.key}
                    className={`absolute overflow-hidden rounded-2xl shadow-md ring-1 ring-slate-200/80 ${tile.className}`}
                  >
                    <Image src={tile.src} alt={tile.alt} fill className="object-cover" sizes="400px" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
