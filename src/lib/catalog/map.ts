import type { ContentRatingId } from "@/data/content-ratings";
import type { Artist, ArtistStats, Project } from "@/types";

export function isContentRatingId(v: unknown): v is ContentRatingId {
  return (
    v === "g" ||
    v === "pg" ||
    v === "pg-13" ||
    v === "r" ||
    v === "unhinged-mom" ||
    v === "unhinged-private"
  );
}

export function mapDbProject(row: Record<string, unknown>): Project {
  const cr = row.content_rating;
  const creatorUserId = row.creator_user_id;
  const creatorIdCol = row.creator_id;
  const creatorId =
    typeof creatorUserId === "string" && creatorUserId.length > 0
      ? `u:${creatorUserId}`
      : creatorIdCol != null && String(creatorIdCol).length > 0
        ? String(creatorIdCol)
        : "unknown";

  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    brief: String(row.brief ?? ""),
    detailsHtml: String(row.details_html ?? ""),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    creatorId,
    categories: Array.isArray(row.categories) ? (row.categories as string[]) : [],
    coverImageUrl: String(row.cover_image_url),
    endsAt: new Date(String(row.ends_at)).toISOString(),
    submissionCount: Number(row.submission_count ?? 0),
    voteCount: Number(row.vote_count ?? 0),
    createdAt: new Date(String(row.created_at)).toISOString(),
    contentRating: isContentRatingId(cr) ? cr : "pg",
  };
}

export function mapDbArtist(row: Record<string, unknown>): Artist {
  const raw = row.stats;
  const stats =
    raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const out: ArtistStats = {
    totalSubmissions: Number(stats.totalSubmissions ?? 0),
    totalVotesReceived: Number(stats.totalVotesReceived ?? 0),
    selectedWins: Number(stats.selectedWins ?? 0),
    projectsJoined: Number(stats.projectsJoined ?? 0),
  };

  return {
    id: String(row.id),
    slug: String(row.slug),
    displayName: String(row.display_name),
    avatarUrl: String(row.avatar_url),
    bio: String(row.bio ?? ""),
    joinedAt: new Date(String(row.joined_at)).toISOString(),
    stats: out,
  };
}
