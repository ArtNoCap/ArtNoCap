/**
 * Content level for a project brief (how bold submissions can be).
 * Stored as `content_rating` on projects (`standard` | `expressive` | `unrestricted`).
 */
export const CONTENT_RATING_OPTIONS = [
  {
    id: "standard",
    label: "Standard",
    line: "Safe for all audiences. Clean, minimal, professional.",
  },
  {
    id: "expressive",
    label: "Expressive",
    line: "Some personality, stylization, or edge.",
  },
  {
    id: "unrestricted",
    label: "Unrestricted",
    line: "Full creative freedom. Push boundaries.",
  },
] as const;

export type ContentRatingId = (typeof CONTENT_RATING_OPTIONS)[number]["id"];

const LEGACY_TO_CURRENT: Record<string, ContentRatingId> = {
  g: "standard",
  pg: "standard",
  "pg-13": "expressive",
  r: "expressive",
  "unhinged-mom": "unrestricted",
  "unhinged-private": "unrestricted",
};

export function isContentRatingId(v: unknown): v is ContentRatingId {
  return v === "standard" || v === "expressive" || v === "unrestricted";
}

/** Normalize DB or draft values (supports legacy six-tier ids until migrated). */
export function normalizeContentRatingFromDb(v: unknown): ContentRatingId {
  if (isContentRatingId(v)) return v;
  const s = typeof v === "string" ? v.trim() : "";
  if (s in LEGACY_TO_CURRENT) return LEGACY_TO_CURRENT[s]!;
  return "standard";
}
