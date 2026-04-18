import type { SupabaseClient } from "@supabase/supabase-js";
import type { Artist } from "@/types";
import { mapDbArtist } from "@/lib/catalog/map";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function slugFromName(name: string, email: string | null) {
  const base = name.trim() || email?.split("@")[0] || "creator";
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "creator";
}

function profileToArtist(profile: {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
}): Artist {
  const displayName = profile.display_name || "Creator";
  return {
    id: `u:${profile.id}`,
    slug: slugFromName(displayName, null),
    displayName,
    avatarUrl:
      profile.avatar_url ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`,
    bio: "",
    joinedAt: typeof profile.created_at === "string" ? profile.created_at : new Date().toISOString(),
    stats: {
      totalSubmissions: 0,
      totalVotesReceived: 0,
      selectedWins: 0,
      projectsJoined: 0,
    },
  };
}

async function fetchArtistFromDb(supabase: SupabaseClient, id: string): Promise<Artist | null> {
  const { data, error } = await supabase.from("artists").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapDbArtist(data as Record<string, unknown>);
}

/** Resolve `Project.creatorId`: `u:<uuid>` → profiles row; otherwise `artists` directory row. */
export async function resolveCreator(creatorId: string): Promise<Artist | undefined> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return undefined;

  if (creatorId.startsWith("u:")) {
    const uid = creatorId.slice(2);
    const { data, error } = await supabase
      .from("profiles")
      .select("id,display_name,avatar_url,created_at")
      .eq("id", uid)
      .maybeSingle();
    if (error || !data) return undefined;
    return profileToArtist(data as { id: string; display_name: string | null; avatar_url: string | null; created_at: string | null });
  }

  const artist = await fetchArtistFromDb(supabase, creatorId);
  return artist ?? undefined;
}

export async function resolveCreatorsForProjects(projects: { creatorId: string }[]): Promise<Map<string, Artist>> {
  const out = new Map<string, Artist>();
  const ids = [...new Set(projects.map((p) => p.creatorId))];
  await Promise.all(
    ids.map(async (id) => {
      const artist = await resolveCreator(id);
      if (artist) out.set(id, artist);
    }),
  );
  return out;
}
