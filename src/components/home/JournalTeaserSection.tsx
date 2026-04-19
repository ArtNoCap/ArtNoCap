import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getBlogPostsSorted } from "@/data/blog-posts";

/** Home-page strip pointing at the Journal (blog) without crowding the hero. */
export async function JournalTeaserSection() {
  const posts = getBlogPostsSorted();
  const latest = posts[0];
  if (!latest) return null;

  return (
    <section className="border-y border-slate-100 bg-white py-10 sm:py-12" aria-labelledby="journal-teaser-heading">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2
            id="journal-teaser-heading"
            className="text-xs font-semibold uppercase tracking-widest text-indigo-600"
          >
            From the journal
          </h2>
          <p className="mt-2 line-clamp-2 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            {latest.title}
          </p>
          <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-slate-600">{latest.summary}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Link
            href={`/blog/${latest.slug}`}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Read latest
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            All posts
          </Link>
        </div>
      </Container>
    </section>
  );
}
