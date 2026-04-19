import type { SupabaseClient } from "@supabase/supabase-js";
import type { Project } from "@/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapDbProject } from "@/lib/catalog/map";
import {
  fetchWinningSubmissionCoverUrlByProjectId,
  overlayWinningSubmissionCovers,
} from "@/lib/catalog/winning-submission-cover";

export async function fetchProjectsFromSupabase(supabase: SupabaseClient): Promise<Project[]> {
  const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
  if (error || !data) return [];
  const projects = data.map((r) => mapDbProject(r as Record<string, unknown>));
  if (projects.length === 0) return projects;
  const urlById = await fetchWinningSubmissionCoverUrlByProjectId(
    supabase,
    projects.map((p) => p.id),
  );
  return overlayWinningSubmissionCovers(projects, urlById);
}

export async function fetchProjectBySlugFromSupabase(
  supabase: SupabaseClient,
  slug: string,
): Promise<Project | null> {
  const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  const project = mapDbProject(data as Record<string, unknown>);
  const urlById = await fetchWinningSubmissionCoverUrlByProjectId(supabase, [project.id]);
  const winner = urlById.get(project.id);
  return winner ? { ...project, coverImageUrl: winner } : project;
}

export async function loadProjectsForApp(): Promise<Project[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  return fetchProjectsFromSupabase(supabase);
}

export async function loadProjectBySlug(slug: string): Promise<Project | undefined> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return undefined;
  const row = await fetchProjectBySlugFromSupabase(supabase, slug);
  return row ?? undefined;
}
