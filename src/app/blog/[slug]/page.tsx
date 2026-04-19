import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogMarkdown } from "@/components/blog/BlogMarkdown";
import { Container } from "@/components/ui/Container";
import { getBlogPostMeta, getBlogPostsSorted } from "@/data/blog-posts";
import { loadBlogPostMarkdown } from "@/lib/blog/load-post-body";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getBlogPostsSorted().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = getBlogPostMeta(slug);
  if (!meta) return { title: "Post not found" };
  return {
    title: meta.title,
    description: meta.summary,
    openGraph: { title: meta.title, description: meta.summary },
  };
}

function formatBlogDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const meta = getBlogPostMeta(slug);
  if (!meta) notFound();

  const markdown = loadBlogPostMarkdown(slug);
  if (!markdown) notFound();

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <Container className="max-w-3xl">
        <div className="mb-8">
          <Link
            href="/blog"
            className="text-sm font-semibold text-indigo-700 hover:text-indigo-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            ← Journal
          </Link>
        </div>

        <article className="rounded-2xl border border-slate-200/80 bg-white px-5 py-8 shadow-sm ring-1 ring-slate-100 sm:px-10 sm:py-12">
          <header className="border-b border-slate-100 pb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">ArtNoCap Journal</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{meta.title}</h1>
            <time className="mt-4 block text-sm font-medium text-slate-500" dateTime={meta.publishedAt}>
              {formatBlogDate(meta.publishedAt)}
            </time>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">{meta.summary}</p>
          </header>

          <div className="pt-10">
            <BlogMarkdown markdown={markdown} />
          </div>
        </article>
      </Container>
    </div>
  );
}
