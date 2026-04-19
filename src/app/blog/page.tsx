import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getBlogPostsSorted } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Editorial notes from ArtNoCap on creative briefs, exploration, voting, and building in public.",
};

function formatBlogDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndexPage() {
  const posts = getBlogPostsSorted();
  const [latest, ...earlier] = posts;

  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <Container className="max-w-3xl">
        <header className="border-b border-slate-200 pb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">ArtNoCap Journal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Ideas in the open</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Longer reads on how we think about briefs, submissions, and choosing directions—same voice as the
            product, without cluttering the main flows.
          </p>
        </header>

        {latest ? (
          <section className="mt-10" aria-labelledby="latest-heading">
            <h2 id="latest-heading" className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Latest
            </h2>
            <article className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
              <time className="text-sm font-medium text-slate-500" dateTime={latest.publishedAt}>
                {formatBlogDate(latest.publishedAt)}
              </time>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                <Link
                  href={`/blog/${latest.slug}`}
                  className="text-slate-900 underline decoration-transparent decoration-2 underline-offset-4 transition hover:text-indigo-800 hover:decoration-indigo-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {latest.title}
                </Link>
              </h3>
              <p className="mt-4 text-base leading-relaxed text-slate-600">{latest.summary}</p>
              <Link
                href={`/blog/${latest.slug}`}
                className="mt-6 inline-flex items-center text-sm font-semibold text-indigo-700 hover:text-indigo-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Read full post →
              </Link>
            </article>
          </section>
        ) : (
          <p className="mt-10 text-slate-600">No posts yet. Check back soon.</p>
        )}

        {earlier.length > 0 ? (
          <section className="mt-14" aria-labelledby="archive-heading">
            <h2 id="archive-heading" className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Earlier posts
            </h2>
            <ul className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-100">
              {earlier.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="flex flex-col gap-1 px-5 py-4 transition hover:bg-slate-50/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-indigo-600 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 sm:px-6 sm:py-5"
                  >
                    <span className="font-semibold text-slate-900">{p.title}</span>
                    <time className="shrink-0 text-sm text-slate-500" dateTime={p.publishedAt}>
                      {formatBlogDate(p.publishedAt)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </div>
  );
}
