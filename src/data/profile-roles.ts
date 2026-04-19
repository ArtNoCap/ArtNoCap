export const PROFILE_ROLE_OPTIONS = [
  {
    id: "artist" as const,
    label: "Artist",
    description: "I create and submit artwork to projects.",
  },
  {
    id: "collector" as const,
    label: "Collector",
    description: "I browse, vote, save favorites, and post briefs.",
  },
  {
    id: "both" as const,
    label: "Artist & collector",
    description: "I do both.",
  },
];

export type ProfileRoleId = (typeof PROFILE_ROLE_OPTIONS)[number]["id"];

export function isProfileRoleId(v: unknown): v is ProfileRoleId {
  return v === "artist" || v === "collector" || v === "both";
}
