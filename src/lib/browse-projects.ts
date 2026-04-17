import { CONTENT_RATING_OPTIONS, type ContentRatingId } from "@/data/content-ratings";
import { PROJECT_CATEGORY_OPTIONS, type ProjectCategoryOptionId } from "@/data/project-form";
import type { Project } from "@/types";
import { daysLeft } from "@/lib/format";

export type BrowseFilterId = "all" | "voting" | "ending" | "popular" | "new";

export type BrowseSortId = "popular" | "newest" | "ending" | "submissions";

export type BrowseRatingFilter = ContentRatingId | "all";

const NEW_MS = 30 * 86_400_000;
const ENDING_DAYS = 21;

export function filterBrowseProjects(projects: Project[], filter: BrowseFilterId, now = new Date()): Project[] {
  if (filter === "all") return projects;

  return projects.filter((p) => {
    if (filter === "voting") return p.submissionCount >= 1;
    if (filter === "ending") return daysLeft(p.endsAt, now) <= ENDING_DAYS;
    if (filter === "popular") return p.voteCount >= 180;
    if (filter === "new") return now.getTime() - new Date(p.createdAt).getTime() <= NEW_MS;
    return true;
  });
}

export function sortBrowseProjects(projects: Project[], sort: BrowseSortId): Project[] {
  const copy = [...projects];
  switch (sort) {
    case "popular":
      return copy.sort((a, b) => b.voteCount - a.voteCount);
    case "newest":
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case "ending":
      return copy.sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime());
    case "submissions":
      return copy.sort((a, b) => b.submissionCount - a.submissionCount);
    default:
      return copy;
  }
}

function ratingSearchBlob(project: Project): string {
  const meta = CONTENT_RATING_OPTIONS.find((o) => o.id === project.contentRating);
  return [project.contentRating, meta?.label, meta?.line].filter(Boolean).join(" ");
}

export function refineBrowseProjects(
  list: Project[],
  opts: {
    search: string;
    categoryIds: ProjectCategoryOptionId[];
    rating: BrowseRatingFilter;
  },
): Project[] {
  let out = list;

  const q = opts.search.trim().toLowerCase();
  if (q) {
    out = out.filter((p) => {
      const blob = [
        p.title,
        p.brief,
        p.slug,
        ...p.tags,
        ...p.categories,
        ratingSearchBlob(p),
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }

  if (opts.categoryIds.length > 0) {
    const labels = new Set(
      opts.categoryIds
        .map((id) => PROJECT_CATEGORY_OPTIONS.find((o) => o.id === id)?.label)
        .filter(Boolean) as string[],
    );
    out = out.filter((p) => p.categories.some((c) => labels.has(c)));
  }

  if (opts.rating !== "all") {
    out = out.filter((p) => p.contentRating === opts.rating);
  }

  return out;
}

/** Keywords and short title tokens for search `<datalist>` suggestions */
export function browseKeywordSuggestions(all: Project[]): string[] {
  const s = new Set<string>();
  for (const p of all) {
    for (const t of p.tags) {
      if (t.trim()) s.add(t.trim());
    }
    for (const c of p.categories) {
      if (c.trim()) s.add(c.trim());
    }
    for (const word of p.title.split(/\s+/)) {
      const w = word.replace(/[^a-zA-Z0-9'-]+/g, "");
      if (w.length >= 3) s.add(w);
    }
  }
  for (const o of CONTENT_RATING_OPTIONS) {
    s.add(o.label);
  }
  return Array.from(s).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}
