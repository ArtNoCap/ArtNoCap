import { NextRequest, NextResponse } from "next/server";
import { isProfileRoleId } from "@/data/profile-roles";
import { mapProfileFromDb } from "@/lib/profile-map";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route";

export const runtime = "nodejs";

function normalizeKeywords(input: unknown): string[] | null {
  let arr: unknown[];
  if (Array.isArray(input)) arr = input;
  else if (typeof input === "string") arr = input.split(",");
  else return null;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of arr) {
    if (typeof item !== "string") continue;
    const t = item.trim().toLowerCase().slice(0, 48);
    if (!t) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length > 24) return null;
  }
  return out;
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
    const kw = normalizeKeywords(o.styleKeywords);
    if (kw === null) {
      return NextResponse.json(
        { ok: false, error: "Use at most 24 keywords, each 48 characters or less." },
        { status: 400 },
      );
    }
    updates.style_keywords = kw;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "No changes to save." }, { status: 400 });
  }

  const upd = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userData.user.id)
    .select("id, display_name, avatar_url, bio, profile_role, style_keywords")
    .single();

  if (upd.error) {
    return NextResponse.json({ ok: false, error: upd.error.message }, { status: 400 });
  }

  const profile = mapProfileFromDb(upd.data as Record<string, unknown>);
  const res = NextResponse.json({ ok: true, profile });
  applyCookies(res);
  return res;
}
