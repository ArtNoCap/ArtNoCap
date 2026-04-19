import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Coming soon: discover artists on ArtNoCap—search, profiles, bios, and more ways to explore creators.",
};

export default function CommunityComingSoonPage() {
  return (
    <div className="bg-slate-50 py-16 sm:py-20">
      <Container className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Coming soon</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Community</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          This space will become your home for <strong className="text-slate-900">finding and learning
          about artists</strong> on ArtNoCap—not just their submissions on a single project, but who
          they are and how they work.
        </p>

        <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">Planned for here</h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed text-slate-600 marker:text-indigo-600">
            <li>Search and browse artists by name, style, or specialty</li>
            <li>Rich artist bios and portfolio-style profiles</li>
            <li>Ways to jump from a creator you like into their public work and active projects</li>
            <li>More community-driven discovery as the platform grows</li>
          </ul>
        </div>

        <p className="mt-8 text-sm text-slate-600">
          Until then, explore{" "}
          <Link
            href="/browse"
            className="font-semibold text-indigo-700 hover:text-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            open projects
          </Link>{" "}
          or the{" "}
          <Link
            href="/leaderboard"
            className="font-semibold text-indigo-700 hover:text-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            leaderboard
          </Link>
          .
        </p>

        <p className="mt-6">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-700 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            ← Back to home
          </Link>
        </p>
      </Container>
    </div>
  );
}
