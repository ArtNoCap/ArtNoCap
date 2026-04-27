import type { SupabaseClient } from "@supabase/supabase-js";
import type { Project } from "@/types";
import { mapDbProject } from "@/lib/catalog/map";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchWinningSubmissionCoverUrlByProjectId, overlayWinningSubmissionCovers } from "@/lib/catalog/winning-submission-cover";

export async function fetchEndedProjectsFromSupabase(
  supabase: SupabaseClient,
  now = new Date(),
): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .is("archived_at", null)
    .lte("ends_at", now.toISOString())
    .order("ends_at", { ascending: false });

  if (error || !data) return [];
  const projects = data.map((r) => mapDbProject(r as Record<string, unknown>));
  if (projects.length === 0) return projects;
  const urlById = await fetchWinningSubmissionCoverUrlByProjectId(
    supabase,
    projects.map((p) => p.id),
  );
  return overlayWinningSubmissionCovers(projects, urlById);
}

export async function loadEndedProjectsForArchive(now = new Date()): Promise<Project[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  return fetchEndedProjectsFromSupabase(supabase, now);
}

