import type { BlogPostMeta } from "@/types/blog";

/**
 * Registry of blog posts. Add a row here and a matching `content/blog/{slug}.md` file for each entry.
 */
export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: "constraints-create-better-work",
    title: "Constraints Don’t Kill Creativity — They Aim It",
    publishedAt: "2026-05-07T12:00:00.000Z",
    summary:
      "Over-specifying a brief shrinks the space for good ideas—but vague briefs create noise. Here’s how to set constraints that invite strong submissions: define the goal, pick the few variables that matter, and leave room where it counts.",
  },
  {
    slug: "how-to-choose-when-everything-is-close",
    title: "How to Choose When Every Submission Feels “Close”",
    publishedAt: "2026-05-08T12:00:00.000Z",
    summary:
      "When multiple designs are good, the decision isn’t about taste alone—it’s about fit under real constraints. Use this simple framework to decide faster: goal alignment, clarity at a glance, durability over time, and practical readiness.",
  },
  {
    slug: "why-you-should-share-your-project",
    title: "Why You Should Share Your Project (And Let People Show Up)",
    publishedAt: "2026-05-06T12:00:00.000Z",
    summary:
      "Keeping a creative project private feels safe—but it quietly limits what you can learn. Here’s why posting a public brief beats endless solo refinement: real interpretations, faster recognition, and a clearer path to a decision.",
  },
  {
    slug: "why-most-design-feedback-doesnt-work",
    title: "Why Most Design Feedback Doesn’t Work (And What to Do Instead)",
    publishedAt: "2026-04-29T12:00:00.000Z",
    summary:
      "Most design feedback fails because it’s vague and context-free. Here’s a better approach: compare multiple directions early, choose what’s strongest, and reduce endless iteration.",
  },
  {
    slug: "why-some-designs-gain-momentum",
    title: "Why Some Designs Gain Momentum (And Others Don’t)",
    publishedAt: "2026-04-25T12:00:00.000Z",
    summary:
      "Some designs spike and fade; others keep earning votes. Here’s what drives design momentum—clarity, coherence, and alignment—so you can pick ideas that hold up beyond first impression.",
  },
  {
    slug: "what-makes-a-design-stand-out-instantly",
    title: "What Makes a Design Stand Out Instantly",
    publishedAt: "2026-04-24T12:00:00.000Z",
    summary:
      "Why do some logos, covers, and layouts grab you in a second? Learn how attention, visual hierarchy, contrast, and context work together—so you can spot standout design when comparing options.",
  },
  {
    slug: "how-to-describe-what-you-want-in-a-design",
    title: "How to Describe What You Want in a Design (And Why It's So Hard)",
    publishedAt: "2026-04-22T12:00:00.000Z",
    summary:
      "Design briefs rely on words—but \"modern\" and \"minimal\" mean different things to different people. Here's why describing a design is hard, why briefs often miss, and how comparing multiple concepts gets you to clarity faster.",
  },
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
