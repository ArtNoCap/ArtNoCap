import type { Metadata } from "next";
import { BrowseProjectsView } from "@/components/browse/BrowseProjectsView";
import { resolveCreatorsForProjects } from "@/lib/catalog/creators";
import { loadProjectsForApp } from "@/lib/catalog/load";

export const metadata: Metadata = {
  title: "Browse Projects",
  description:
    "Browse active design briefs on ArtNoCap—project cards only. Open a project to see submissions and voting.",
};

export default async function BrowseProjectsPage() {
  const catalogProjects = await loadProjectsForApp();
  const creatorsByCreatorId = await resolveCreatorsForProjects(catalogProjects);
  return (
    <BrowseProjectsView catalogProjects={catalogProjects} creatorsByCreatorId={creatorsByCreatorId} />
  );
}
