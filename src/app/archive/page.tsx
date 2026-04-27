import type { Metadata } from "next";
import { ArchiveProjectsView } from "@/components/archive/ArchiveProjectsView";
import { resolveCreatorsForProjects } from "@/lib/catalog/creators";
import { loadEndedProjectsForArchive } from "@/lib/archive/load-archived-projects";

export const metadata: Metadata = {
  title: "Project Archive",
  description: "Completed briefs, final results, and the winning designs.",
};

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const projects = await loadEndedProjectsForArchive();
  const creatorsByCreatorId = await resolveCreatorsForProjects(projects);
  return <ArchiveProjectsView projects={projects} creatorsByCreatorId={creatorsByCreatorId} />;
}

