import { isProfileRoleId } from "@/data/profile-roles";
import type { UserProfileRow } from "@/types/user-profile";

export function mapProfileFromDb(row: Record<string, unknown>): UserProfileRow {
  const kw = row.style_keywords;
  const styleKeywords = Array.isArray(kw) ? kw.map((k) => String(k).trim()).filter(Boolean) : [];
  const role = row.profile_role;
  return {
    id: String(row.id),
    displayName: String(row.display_name ?? ""),
    avatarUrl: row.avatar_url == null || row.avatar_url === "" ? null : String(row.avatar_url),
    bio: String(row.bio ?? ""),
    profileRole: isProfileRoleId(role) ? role : "both",
    styleKeywords,
  };
}
