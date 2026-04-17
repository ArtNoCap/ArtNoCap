import type { Metadata } from "next";
import { StartProjectPage } from "@/components/projects/new/StartProjectPage";

export const metadata: Metadata = {
  title: "Start a project",
  description:
    "Create a design brief as a project on ArtNoCap. This MVP previews the form—persistence arrives with Supabase.",
};

export default function NewProjectPage() {
  return <StartProjectPage />;
}
