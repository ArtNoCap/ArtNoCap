import type { Metadata } from "next";
import { BrowseProjectsView } from "@/components/browse/BrowseProjectsView";

export const metadata: Metadata = {
  title: "Browse Projects",
  description:
    "Browse active design briefs on ArtNoCap—project cards only. Open a project to see submissions and voting.",
};

export default function BrowseProjectsPage() {
  return <BrowseProjectsView />;
}
