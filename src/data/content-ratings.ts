/**
 * Rough content / intensity scale for a project brief (not a legal rating).
 * Includes two high-intensity options after R (UNHINGED and Worse than UNHINGED).
 */
export const CONTENT_RATING_OPTIONS = [
  { id: "g", label: "G", line: "All audiences; nothing spicy." },
  { id: "pg", label: "PG", line: "Mild themes; still pretty tame." },
  { id: "pg-13", label: "PG-13", line: "Stronger themes; use judgment." },
  { id: "r", label: "R", line: "Mature or intense; not for kids." },
  {
    id: "unhinged-mom",
    label: "UNHINGED",
    line: "Slightly embarrassed if my mom saw it.",
  },
  {
    id: "unhinged-private",
    label: "Worse than UNHINGED",
    line: "I'm not showing anyone.",
  },
] as const;

export type ContentRatingId = (typeof CONTENT_RATING_OPTIONS)[number]["id"];
