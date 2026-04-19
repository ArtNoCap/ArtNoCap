import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route";

export const runtime = "nodejs";

/**
 * Soft-archive a project the user created: hidden from browse/detail; submissions get archived_at
 * for a future searchable archive (DB trigger stamps submissions).
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const trimmed = slug.trim();
  if (!trimmed) {
    return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
  }

  const { supabase, applyCookies } = createSupabaseRouteHandlerClient(req);
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const userId = userData.user.id;

  const { data: row, error: selErr } = await supabase
    .from("projects")
    .select("id, ends_at, archived_at, creator_user_id")
    .eq("slug", trimmed)
    .maybeSingle();

  if (selErr || !row) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  if (row.archived_at) {
    return NextResponse.json({ ok: false, error: "Project is already removed from the site" }, { status: 409 });
  }

  if (String(row.creator_user_id) !== userId) {
    return NextResponse.json({ ok: false, error: "Only the project creator can remove it" }, { status: 403 });
  }

  const endsMs = new Date(String(row.ends_at)).getTime();
  if (endsMs <= Date.now()) {
    return NextResponse.json(
      { ok: false, error: "This project has already ended; it cannot be removed this way." },
      { status: 400 },
    );
  }

  const archivedAt = new Date().toISOString();
  const { error: upErr } = await supabase
    .from("projects")
    .update({ archived_at: archivedAt })
    .eq("id", String(row.id))
    .eq("creator_user_id", userId)
    .is("archived_at", null);

  if (upErr) {
    return NextResponse.json({ ok: false, error: upErr.message }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  applyCookies(res);
  return res;
}
