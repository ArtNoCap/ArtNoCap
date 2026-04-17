import type { Project, ProjectSpotlight } from "@/types";

const DAY_MS = 86_400_000;

export function deriveProjectSpotlights(
  projects: Project[],
  now = new Date(),
): Record<string, ProjectSpotlight | undefined> {
  const byId: Record<string, ProjectSpotlight | undefined> = {};

  // Hot: top 5 by votes (global).
  const topHot = [...projects]
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, 5)
    .map((p) => p.id);
  const hotSet = new Set(topHot);

  for (const p of projects) {
    const isNew = now.getTime() - new Date(p.createdAt).getTime() <= DAY_MS;
    const isHot = hotSet.has(p.id);

    // Only one pill can show; prioritize Hot over New.
    byId[p.id] = isHot ? "hot" : isNew ? "new" : undefined;
  }

  return byId;
}

