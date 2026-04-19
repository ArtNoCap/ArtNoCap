export interface BlogPostMeta {
  slug: string;
  title: string;
  /** ISO 8601 */
  publishedAt: string;
  /** Short card / SEO description */
  summary: string;
}
