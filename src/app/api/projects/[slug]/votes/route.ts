import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadProjectBySlug } from "@/lib/catalog/load";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route";
import { isUuid } from "@/lib/is-uuid";

export const runtime = "nodejs";

async function buildVoteResponsePayload(supabase: SupabaseClient, projectId: string) {
  const { data: subs } = await supabase.from("submissions").select("id,vote_count").eq("project_id", projectId);
  const voteCounts: Record<string, number> = {};
  for (const s of subs ?? []) {
    voteCounts[String(s.id)] = Number(s.vote_count ?? 0);
  }

  const { data: mine } = await supabase.from("votes").select("submission_id").eq("project_id", projectId).maybeSingle();

  return {
    voteCounts,
    myVoteSubmissionId: mine?.submission_id ? String(mine.submission_id) : null,
  };
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const project = await loadProjectBySlug(slug);
  if (!project) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => null)) as { submissionId?: string | null } | null;
  if (!body || !("submissionId" in body)) {
    return NextResponse.json({ ok: false, error: "Missing submissionId (use null to clear)" }, { status: 400 });
  }
  const submissionId = body.submissionId;

  const { supabase, applyCookies } = createSupabaseRouteHandlerClient(req);
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (submissionId === null) {
    const del = await supabase.from("votes").delete().eq("user_id", userData.user.id).eq("project_id", project.id);
    if (del.error) {
      return NextResponse.json({ ok: false, error: del.error.message }, { status: 400 });
    }
    const payload = await buildVoteResponsePayload(supabase, project.id);
    const res = NextResponse.json({ ok: true, ...payload });
    applyCookies(res);
    return res;
  }

  if (typeof submissionId !== "string" || !isUuid(submissionId)) {
    return NextResponse.json({ ok: false, error: "Invalid submissionId" }, { status: 400 });
  }

  const sub = await supabase.from("submissions").select("id,project_id").eq("id", submissionId).maybeSingle();
  if (sub.error || !sub.data || String(sub.data.project_id) !== project.id) {
    return NextResponse.json({ ok: false, error: "Submission not in this project" }, { status: 400 });
  }

  const upsert = await supabase.from("votes").upsert(
    {
      user_id: userData.user.id,
      project_id: project.id,
      submission_id: submissionId,
    },
    { onConflict: "user_id,project_id" },
  );

  if (upsert.error) {
    return NextResponse.json({ ok: false, error: upsert.error.message }, { status: 400 });
  }

  const payload = await buildVoteResponsePayload(supabase, project.id);
  const res = NextResponse.json({ ok: true, ...payload });
  applyCookies(res);
  return res;
}
