import { PROFILE_MAX_STYLE_KEYWORDS } from "@/data/profile-limits";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CommunitySortId = "most_active" | "newest";

export type CommunityFilters = {
  q?: string;
  profileRole?: "artist" | "collector" | "both";
  styles?: string[];
  specialties?: string[];
  experienceLevels?: Array<"newcomer" | "intermediate" | "pro">;
  availability?: Array<"open" | "soon" | "closed">;
  location?: string;
  sort?: CommunitySortId;
};

export type CommunityProfile = {
  id: string;
  slug: string;
  displayName: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string;
  profileRole: "artist" | "collector" | "both";
  styleKeywords: string[];
  specialties: string[];
  experienceLevel: "newcomer" | "intermediate" | "pro";
  location: string;
  availability: "open" | "soon" | "closed";
  createdAt: string;
};

function normalizeTagArray(input: string[] | undefined): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input ?? []) {
    const t = String(raw ?? "")
      .trim()
      .toLowerCase()
      .slice(0, 48);
    if (!t) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= 24) break;
  }
  return out;
}

function normalizeText(input: string | undefined, max = 80): string {
  return String(input ?? "")
    .trim()
    .slice(0, max);
}

function fallbackSlug(id: string, displayName: string): string {
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

export async function listCommunityProfiles(filters: CommunityFilters): Promise<CommunityProfile[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const styles = normalizeTagArray(filters.styles);
  const specialties = normalizeTagArray(filters.specialties);
  const q = normalizeText(filters.q, 120).toLowerCase();
  const location = normalizeText(filters.location, 80).toLowerCase();

  let query = supabase
    .from("profiles")
    .select(
      "id, slug, display_name, avatar_url, banner_url, bio, profile_role, style_keywords, specialties, experience_level, location, availability, created_at",
    )
    .eq("is_public", true)
    .eq("email_verified", true);

  if (filters.profileRole) {
    query = query.eq("profile_role", filters.profileRole);
  }
  if (styles.length > 0) {
    query = query.contains("style_keywords", styles);
  }
  if (specialties.length > 0) {
    query = query.contains("specialties", specialties);
  }
  if (filters.experienceLevels && filters.experienceLevels.length > 0) {
    query = query.in("experience_level", filters.experienceLevels);
  }
  if (filters.availability && filters.availability.length > 0) {
    query = query.in("availability", filters.availability);
  }
  if (location) {
    query = query.ilike("location", `%${location}%`);
  }

  // Simple sort options we can support today without computed stats.
  if ((filters.sort ?? "most_active") === "newest") {
    query = query.order("created_at", { ascending: false });
  } else {
    // “Most active” placeholder until we add activity stats.
    query = query.order("updated_at", { ascending: false });
  }

  const res = await query.limit(120);
  if (res.error) return [];

  const rows = res.data ?? [];
  const mapped: CommunityProfile[] = rows.map((r) => {
    const id = String(r.id);
    const displayName = String((r as any).display_name ?? "");
    const slugRaw = String((r as any).slug ?? "").trim();
    const slug = slugRaw || fallbackSlug(id, displayName);
    return {
      id,
      slug,
      displayName,
      avatarUrl: (r as any).avatar_url ? String((r as any).avatar_url) : null,
      bannerUrl: (r as any).banner_url ? String((r as any).banner_url) : null,
      bio: String((r as any).bio ?? ""),
      profileRole: (String((r as any).profile_role ?? "both") as any) ?? "both",
      styleKeywords: (
        Array.isArray((r as any).style_keywords)
          ? (r as any).style_keywords.map((x: any) => String(x)).filter(Boolean)
          : []
      ).slice(0, PROFILE_MAX_STYLE_KEYWORDS),
      specialties: Array.isArray((r as any).specialties)
        ? (r as any).specialties.map((x: any) => String(x)).filter(Boolean)
        : [],
      experienceLevel: (String((r as any).experience_level ?? "newcomer") as any) ?? "newcomer",
      location: String((r as any).location ?? ""),
      availability: (String((r as any).availability ?? "open") as any) ?? "open",
      createdAt: typeof (r as any).created_at === "string" ? (r as any).created_at : new Date().toISOString(),
    };
  });

  if (!q) return mapped;

  // Lightweight in-memory search across a few fields (keeps SQL simple).
  const terms = q.split(/\s+/g).filter(Boolean).slice(0, 6);
  if (terms.length === 0) return mapped;

  return mapped.filter((p) => {
    const hay = [
      p.slug,
      p.displayName,
      p.bio,
      p.location,
      p.styleKeywords.join(" "),
      p.specialties.join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

