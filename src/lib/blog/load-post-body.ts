import fs from "node:fs";
import path from "node:path";

export function loadBlogPostMarkdown(slug: string): string | null {
  const filePath = path.join(process.cwd(), "content", "blog", `${slug}.md`);
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}
