import { PROFILE_MAX_SPECIALTIES, PROFILE_MAX_STYLE_KEYWORDS, PROFILE_TAG_MAX_CHARS } from "@/data/profile-limits";
import { isProfileRoleId } from "@/data/profile-roles";
import type { UserProfileRow } from "@/types/user-profile";

function fallbackSlugFromRow(id: string, displayName: string): string {
  const base = displayName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  const safeBase = base || "creator";
  const suffix = id.replace(/-/g, "").slice(0, 8);
  return `${safeBase}-${suffix}`.slice(0, 40);
}

function normalizeKeywordArray(input: unknown, max: number): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of input) {
    const t = String(item ?? "")
      .trim()
      .toLowerCase()
      .slice(0, PROFILE_TAG_MAX_CHARS);
    if (!t) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= max) break;
  }
  return out;
}

export function mapProfileFromDb(row: Record<string, unknown>): UserProfileRow {
  const styleKeywords = normalizeKeywordArray(row.style_keywords, PROFILE_MAX_STYLE_KEYWORDS);
  const specialties = normalizeKeywordArray(row.specialties, PROFILE_MAX_SPECIALTIES);
  const role = row.profile_role;
  const experienceLevelRaw = String(row.experience_level ?? "newcomer");
  const availabilityRaw = String(row.availability ?? "open");

  const experienceLevel =
    experienceLevelRaw === "intermediate" || experienceLevelRaw === "pro" ? experienceLevelRaw : "newcomer";
  const availability =
    availabilityRaw === "soon" || availabilityRaw === "closed" ? availabilityRaw : "open";

  const id = String(row.id);
  const displayName = String(row.display_name ?? "");
  const slugRaw = String(row.slug ?? "").trim();
  const slug = slugRaw || fallbackSlugFromRow(id, displayName);

  const createdAtRaw = row.created_at;
  const createdAt =
    typeof createdAtRaw === "string" && createdAtRaw.trim()
      ? new Date(createdAtRaw).toISOString()
      : undefined;

  const isPublicRaw = row.is_public;
  const isPublic = isPublicRaw === true || isPublicRaw === "true";

  const emailVerifiedRaw = row.email_verified;
  const emailVerified = emailVerifiedRaw === true || emailVerifiedRaw === "true";

  return {
    id,
    slug,
    displayName,
    avatarUrl: row.avatar_url == null || row.avatar_url === "" ? null : String(row.avatar_url),
    bannerUrl: row.banner_url == null || row.banner_url === "" ? null : String(row.banner_url),
    bio: String(row.bio ?? ""),
    profileRole: isProfileRoleId(role) ? role : "both",
    styleKeywords,
    specialties,
    experienceLevel,
    location: String(row.location ?? ""),
    availability,
    isPublic,
    emailVerified,
    createdAt,
  };
}
