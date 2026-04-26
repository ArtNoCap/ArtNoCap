import { PROFILE_TAG_MAX_CHARS } from "@/data/profile-limits";

export type ParseProfileTagsResult =
  | { ok: true; tags: string[] }
  | { ok: false; reason: "invalid_type" | "too_many" };

/**
 * Parse style keywords or specialties from PATCH JSON: comma-separated string or string array.
 * Dedupes (case-insensitive), enforces per-tag length, and rejects if distinct tags exceed `max`.
 */
export function parseProfileTagsInput(input: unknown, max: number): ParseProfileTagsResult {
  let items: string[];
  if (Array.isArray(input)) {
    items = input.filter((x): x is string => typeof x === "string");
  } else if (typeof input === "string") {
    items = input.split(",");
  } else {
    return { ok: false, reason: "invalid_type" };
  }

  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const t = item.trim().toLowerCase().slice(0, PROFILE_TAG_MAX_CHARS);
    if (!t) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length > max) return { ok: false, reason: "too_many" };
  }
  return { ok: true, tags: out };
}
