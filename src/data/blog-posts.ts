import type { BlogPostMeta } from "@/types/blog";

/**
 * Registry of blog posts. Add a row here and a matching `content/blog/{slug}.md` file for each entry.
 */
export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: "subjective-art-voting-helps",
    title: "The Subjective Nature of Art — And Why Voting Helps You Decide",
    publishedAt: "2026-04-20T12:00:00.000Z",
    summary:
      "Art isn't objective—so how do you choose? Voting doesn't replace your taste; it adds context, patterns, and a clearer view of what resonates before you commit.",
  },
  {
    slug: "why-more-ideas-matter",
    title: "Why More Ideas Matter: The Case for Exploration in Creative Work",
    publishedAt: "2026-04-18T12:00:00.000Z",
    summary:
      "Creative work is subjective—and the best direction often only appears after you've compared real options. Here's why exploration and contrast beat refining a single idea in isolation.",
  },
];

export function getBlogPostsSorted(): BlogPostMeta[] {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getBlogPostMeta(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
