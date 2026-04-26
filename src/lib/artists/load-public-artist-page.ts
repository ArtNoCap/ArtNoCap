import { mapDbArtist } from "@/lib/catalog/map";
import { mapProfileFromDb } from "@/lib/profile-map";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Artist } from "@/types";
import type { UserProfileRow } from "@/types/user-profile";

export type PublicArtistSubmission = {
  id: string;
  projectId: string;
  projectSlug: string;
  imageUrl: string;
  voteCount: number;
  createdAt: string;
};

export type PublicArtistSelectedWin = {
  submissionId: string;
  projectId: string;
  projectSlug: string;
  projectTitle: string;
  imageUrl: string;
  createdAt: string;
};

export type PublicArtistStats = {
  submissions: number;
  totalVotes: number;
  selectedWins: number;
  projectsJoined: number;
};

export type PublicArtistPageData =
  | { kind: "none" }
  | {
      kind: "profile";
      slug: string;
      profile: UserProfileRow;
      stats: PublicArtistStats;
      submissions: PublicArtistSubmission[];
      selectedWins: PublicArtistSelectedWin[];
    }
  | {
      kind: "directory";
      slug: string;
      artist: Artist;
    };

type SubmissionRow = {
  id: string;
  project_id: string;
  project_slug: string;
  public_url: string;
  vote_count: number;
  created_at: string;
};

export async function loadPublicArtistPageData(rawSlug: string): Promise<PublicArtistPageData> {
  const slug = String(rawSlug || "").trim();
  if (!slug) return { kind: "none" };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { kind: "none" };

  const { data: profileRow } = await supabase
    .from("profiles")
    .select(
      "id, slug, display_name, avatar_url, banner_url, bio, profile_role, style_keywords, specialties, experience_level, location, availability, is_public, email_verified, created_at",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (profileRow) {
    const profile = mapProfileFromDb(profileRow as Record<string, unknown>);
    if (!profile.isPublic || !profile.emailVerified) {
      return { kind: "none" };
    }

    const { data: subRows, error: subErr } = await supabase
      .from("submissions")
      .select("id, project_id, project_slug, public_url, vote_count, created_at")
      .eq("user_id", profile.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(240);

    const submissions: PublicArtistSubmission[] = !subErr
      ? (subRows ?? []).map((r) => ({
          id: String((r as SubmissionRow).id),
          projectId: String((r as SubmissionRow).project_id),
          projectSlug: String((r as SubmissionRow).project_slug),
          imageUrl: String((r as SubmissionRow).public_url),
          voteCount: Number((r as SubmissionRow).vote_count ?? 0),
          createdAt: new Date(String((r as SubmissionRow).created_at)).toISOString(),
        }))
      : [];

    const totalVotes = submissions.reduce((sum, s) => sum + (Number.isFinite(s.voteCount) ? s.voteCount : 0), 0);
    const projectsJoined = new Set(submissions.map((s) => s.projectId)).size;

    const projectIds = [...new Set(submissions.map((s) => s.projectId))].slice(0, 80);
    const now = Date.now();

    let selectedWins = 0;
    const selectedWinCards: PublicArtistSelectedWin[] = [];

    if (projectIds.length > 0) {
      const { data: projRows } = await supabase
        .from("projects")
        .select("id, slug, title, ends_at, archived_at")
        .in("id", projectIds)
        .is("archived_at", null);

      const projects = (projRows ?? []).map((p) => ({
        id: String((p as any).id),
        slug: String((p as any).slug),
        title: String((p as any).title ?? "Project"),
        endsAtMs: new Date(String((p as any).ends_at)).getTime(),
      }));

      const endedProjectIds = new Set(projects.filter((p) => p.endsAtMs <= now).map((p) => p.id));
      const projectMeta = new Map(projects.map((p) => [p.id, p] as const));

      if (endedProjectIds.size > 0) {
        const endedIds = [...endedProjectIds];
        const { data: compRows } = await supabase
          .from("submissions")
          .select("id, project_id, vote_count, created_at, archived_at")
          .in("project_id", endedIds)
          .is("archived_at", null)
          .limit(2000);

        const bestByProject = new Map<
          string,
          { id: string; voteCount: number; createdAtMs: number }
        >();

        for (const r of compRows ?? []) {
          const pid = String((r as any).project_id);
          if (!endedProjectIds.has(pid)) continue;
          const id = String((r as any).id);
          const voteCount = Number((r as any).vote_count ?? 0);
          const createdAtMs = new Date(String((r as any).created_at)).getTime();
          const cur = bestByProject.get(pid);
          if (!cur || voteCount > cur.voteCount || (voteCount === cur.voteCount && createdAtMs < cur.createdAtMs)) {
            bestByProject.set(pid, { id, voteCount, createdAtMs });
          }
        }

        const mineByProject = new Map(submissions.map((s) => [s.projectId, s] as const));

        for (const pid of endedIds) {
          const best = bestByProject.get(pid);
          const mine = mineByProject.get(pid);
          if (!best || !mine) continue;
          if (best.id !== mine.id) continue;
          selectedWins += 1;

          const meta = projectMeta.get(pid);
          if (meta && selectedWinCards.length < 12) {
            selectedWinCards.push({
              submissionId: mine.id,
              projectId: pid,
              projectSlug: meta.slug,
              projectTitle: meta.title,
              imageUrl: mine.imageUrl,
              createdAt: mine.createdAt,
            });
          }
        }
      }
    }

    const submissionsCount = submissions.length;

    return {
      kind: "profile",
      slug,
      profile,
      stats: {
        submissions: submissionsCount,
        totalVotes,
        selectedWins,
        projectsJoined,
      },
      submissions,
      selectedWins: selectedWinCards,
    };
  }

  const { data: artistRow } = await supabase.from("artists").select("*").eq("slug", slug).maybeSingle();
  if (!artistRow) return { kind: "none" };

  return { kind: "directory", slug, artist: mapDbArtist(artistRow as Record<string, unknown>) };
}
