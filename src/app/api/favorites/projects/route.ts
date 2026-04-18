import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route";

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
  const ids = parseIdsParam(url.searchParams.get("ids")).filter((id) => id.length > 0 && id.length <= 128);
  if (ids.length === 0) {
    const res = NextResponse.json({ ok: true, favorited: [] as string[] });
    applyCookies(res);
    return res;
  }

  const q = await supabase.from("favorite_projects").select("project_id").eq("user_id", data.user.id).in("project_id", ids);
  if (q.error) {
    return NextResponse.json({ ok: false, error: q.error.message }, { status: 400 });
  }

  const favorited = (q.data ?? []).map((r) => r.project_id).filter(Boolean);
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

  const body = (await req.json().catch(() => null)) as { projectId?: string } | null;
  const projectId = body?.projectId?.trim();
  if (!projectId) {
    return NextResponse.json({ ok: false, error: "Missing projectId" }, { status: 400 });
  }

  const ins = await supabase.from("favorite_projects").insert({ user_id: data.user.id, project_id: projectId });
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

  const body = (await req.json().catch(() => null)) as { projectId?: string } | null;
  const projectId = body?.projectId?.trim();
  if (!projectId) {
    return NextResponse.json({ ok: false, error: "Missing projectId" }, { status: 400 });
  }

  const del = await supabase.from("favorite_projects").delete().eq("user_id", data.user.id).eq("project_id", projectId);
  if (del.error) {
    return NextResponse.json({ ok: false, error: del.error.message }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true, favorited: false });
  applyCookies(res);
  return res;
}
