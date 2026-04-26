import { NextRequest, NextResponse } from "next/server";
import { PROFILE_MAX_SPECIALTIES, PROFILE_MAX_STYLE_KEYWORDS, PROFILE_TAG_MAX_CHARS } from "@/data/profile-limits";
import { isProfileRoleId } from "@/data/profile-roles";
import { mapProfileFromDb } from "@/lib/profile-map";
import { parseProfileTagsInput } from "@/lib/profile-tags";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route";

export const runtime = "nodejs";

function isExperienceLevelId(v: unknown): v is "newcomer" | "intermediate" | "pro" {
  return v === "newcomer" || v === "intermediate" || v === "pro";
}

function isAvailabilityId(v: unknown): v is "open" | "soon" | "closed" {
  return v === "open" || v === "soon" || v === "closed";
}

function normalizePublicSlug(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  if (s.length < 3 || s.length > 40) return null;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) return null;
  return s;
}

export async function PATCH(req: NextRequest) {
  let supabase: ReturnType<typeof createSupabaseRouteHandlerClient>["supabase"];
  let applyCookies: ReturnType<typeof createSupabaseRouteHandlerClient>["applyCookies"];
  try {
    ({ supabase, applyCookies } = createSupabaseRouteHandlerClient(req));
  } catch {
    return NextResponse.json({ ok: false, error: "Supabase is not configured" }, { status: 501 });
  }

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }
  const o = body as Record<string, unknown>;
  const updates: Record<string, unknown> = {};

  if ("displayName" in o) {
    const dn = String(o.displayName ?? "").trim();
    if (dn.length < 2 || dn.length > 80) {
      return NextResponse.json(
        { ok: false, error: "Display name must be between 2 and 80 characters." },
        { status: 400 },
      );
    }
    updates.display_name = dn;
  }
  if ("bio" in o) {
    const bio = String(o.bio ?? "").trim();
    if (bio.length > 2000) {
      return NextResponse.json({ ok: false, error: "Bio must be 2000 characters or less." }, { status: 400 });
    }
    updates.bio = bio;
  }
  if ("profileRole" in o) {
    if (!isProfileRoleId(o.profileRole)) {
      return NextResponse.json({ ok: false, error: "Invalid profile role." }, { status: 400 });
    }
    updates.profile_role = o.profileRole;
  }
  if ("styleKeywords" in o) {
    const kw = parseProfileTagsInput(o.styleKeywords, PROFILE_MAX_STYLE_KEYWORDS);
    if (!kw.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            kw.reason === "invalid_type"
              ? "Style keywords must be a comma-separated string or a list of strings."
              : `Use at most ${PROFILE_MAX_STYLE_KEYWORDS} style keywords, each ${PROFILE_TAG_MAX_CHARS} characters or less.`,
        },
        { status: 400 },
      );
    }
    updates.style_keywords = kw.tags;
  }
  if ("specialties" in o) {
    const sp = parseProfileTagsInput(o.specialties, PROFILE_MAX_SPECIALTIES);
    if (!sp.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            sp.reason === "invalid_type"
              ? "Specialties must be a comma-separated string or a list of strings."
              : `Use at most ${PROFILE_MAX_SPECIALTIES} specialties, each ${PROFILE_TAG_MAX_CHARS} characters or less.`,
        },
        { status: 400 },
      );
    }
    updates.specialties = sp.tags;
  }
  if ("experienceLevel" in o) {
    if (!isExperienceLevelId(o.experienceLevel)) {
      return NextResponse.json({ ok: false, error: "Invalid experience level." }, { status: 400 });
    }
    updates.experience_level = o.experienceLevel;
  }
  if ("availability" in o) {
    if (!isAvailabilityId(o.availability)) {
      return NextResponse.json({ ok: false, error: "Invalid availability." }, { status: 400 });
    }
    updates.availability = o.availability;
  }
  if ("location" in o) {
    const loc = String(o.location ?? "").trim().slice(0, 80);
    updates.location = loc;
  }
  if ("slug" in o) {
    const slug = normalizePublicSlug(String(o.slug ?? ""));
    if (!slug) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Public profile URL must be 3–40 characters: lowercase letters, numbers, and single hyphens between segments.",
        },
        { status: 400 },
      );
    }
    updates.slug = slug;
  }
  if ("isPublic" in o) {
    if (typeof o.isPublic !== "boolean") {
      return NextResponse.json({ ok: false, error: "isPublic must be true or false." }, { status: 400 });
    }
    updates.is_public = o.isPublic;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "No changes to save." }, { status: 400 });
  }

  const upd = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userData.user.id)
    .select(
      "id, slug, display_name, avatar_url, banner_url, bio, profile_role, style_keywords, specialties, experience_level, location, availability, is_public, email_verified, created_at",
    )
    .single();

  if (upd.error) {
    const msg = upd.error.message || "";
    if (msg.toLowerCase().includes("profiles_slug_unique") || msg.toLowerCase().includes("duplicate key")) {
      return NextResponse.json({ ok: false, error: "That public profile URL is already taken. Try another." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: upd.error.message }, { status: 400 });
  }

  const profile = mapProfileFromDb(upd.data as Record<string, unknown>);
  const res = NextResponse.json({ ok: true, profile });
  applyCookies(res);
  return res;
}
