import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route";
import { isUuid } from "@/lib/is-uuid";

export const runtime = "nodejs";

function parseIdsParam(raw: string | null): string[] {
  if (!raw) return [];
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const uniq: string[] = [];
  const seen = new Set<string>();
  for (const p of parts) {
    if (!seen.has(p)) {
      seen.add(p);
      uniq.push(p);
    }
  }
  return uniq;
}

export async function GET(req: NextRequest) {
  const { supabase, applyCookies } = createSupabaseRouteHandlerClient(req);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    const res = NextResponse.json({ ok: true, favorited: [] as string[] });
    applyCookies(res);
    return res;
  }

  const url = new URL(req.url);
  const ids = parseIdsParam(url.searchParams.get("ids")).filter(isUuid);
  if (ids.length === 0) {
    const res = NextResponse.json({ ok: true, favorited: [] as string[] });
    applyCookies(res);
    return res;
  }

  const q = await supabase
    .from("favorite_submissions")
    .select("submission_id")
    .eq("user_id", data.user.id)
    .in("submission_id", ids);
  if (q.error) {
    return NextResponse.json({ ok: false, error: q.error.message }, { status: 400 });
  }

  const favorited = (q.data ?? []).map((r) => r.submission_id).filter(Boolean);
  const res = NextResponse.json({ ok: true, favorited });
  applyCookies(res);
  return res;
}

export async function POST(req: NextRequest) {
  const { supabase, applyCookies } = createSupabaseRouteHandlerClient(req);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { submissionId?: string } | null;
  const submissionId = body?.submissionId?.trim();
  if (!submissionId) {
    return NextResponse.json({ ok: false, error: "Missing submissionId" }, { status: 400 });
  }
  if (!isUuid(submissionId)) {
    return NextResponse.json({ ok: false, error: "Invalid submissionId" }, { status: 400 });
  }

  const ins = await supabase.from("favorite_submissions").insert({ user_id: data.user.id, submission_id: submissionId });
  if (ins.error) {
    const code = (ins.error as { code?: string } | null)?.code;
    if (code === "23505") {
      const res = NextResponse.json({ ok: true, favorited: true, deduped: true });
      applyCookies(res);
      return res;
    }
    return NextResponse.json({ ok: false, error: ins.error.message }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true, favorited: true });
  applyCookies(res);
  return res;
}

export async function DELETE(req: NextRequest) {
  const { supabase, applyCookies } = createSupabaseRouteHandlerClient(req);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { submissionId?: string } | null;
  const submissionId = body?.submissionId?.trim();
  if (!submissionId) {
    return NextResponse.json({ ok: false, error: "Missing submissionId" }, { status: 400 });
  }
  if (!isUuid(submissionId)) {
    return NextResponse.json({ ok: false, error: "Invalid submissionId" }, { status: 400 });
  }

  const del = await supabase
    .from("favorite_submissions")
    .delete()
    .eq("user_id", data.user.id)
    .eq("submission_id", submissionId);
  if (del.error) {
    return NextResponse.json({ ok: false, error: del.error.message }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true, favorited: false });
  applyCookies(res);
  return res;
}
