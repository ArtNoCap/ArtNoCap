import type { SupabaseClient } from "@supabase/supabase-js";
import type { Project } from "@/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapDbProject } from "@/lib/catalog/map";

export async function fetchProjectsFromSupabase(supabase: SupabaseClient): Promise<Project[]> {
  const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => mapDbProject(r as Record<string, unknown>));
}

export async function fetchProjectBySlugFromSupabase(
  supabase: SupabaseClient,
  slug: string,
): Promise<Project | null> {
  const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  return mapDbProject(data as Record<string, unknown>);
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
