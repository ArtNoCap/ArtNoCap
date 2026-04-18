import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StartProjectPage } from "@/components/projects/new/StartProjectPage";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Start a project",
  description:
    "Create a design brief as a project on ArtNoCap. This MVP previews the form—persistence arrives with Supabase.",
};

export default async function NewProjectPage() {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      redirect(`/login?returnTo=${encodeURIComponent("/projects/new")}`);
    }
  }
  return <StartProjectPage />;
}
