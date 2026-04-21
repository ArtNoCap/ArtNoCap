import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadProjectBySlug } from "@/lib/catalog/load";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { isUuid } from "@/lib/is-uuid";
import { GUEST_VOTER_COOKIE, guestVoterCookieOptions } from "@/lib/voting/guest-session";

export const runtime = "nodejs";

async function buildVoteResponsePayload(
  readClient: SupabaseClient,
  projectId: string,
  mine:
    | { kind: "user"; userId: string; client: SupabaseClient }
    | { kind: "guest"; sessionId: string; admin: SupabaseClient },
) {
  const { data: subs } = await readClient.from("submissions").select("id,vote_count").eq("project_id", projectId);
  const voteCounts: Record<string, number> = {};
  for (const s of subs ?? []) {
    voteCounts[String(s.id)] = Number(s.vote_count ?? 0);
  }

  let myVoteSubmissionId: string | null = null;
  if (mine.kind === "user") {
    const { data: row } = await mine.client
      .from("votes")
      .select("submission_id")
      .eq("project_id", projectId)
      .eq("user_id", mine.userId)
      .maybeSingle();
    myVoteSubmissionId = row?.submission_id ? String(row.submission_id) : null;
  } else {
    const { data: row } = await mine.admin
      .from("anonymous_votes")
      .select("submission_id")
      .eq("project_id", projectId)
      .eq("session_id", mine.sessionId)
      .maybeSingle();
    myVoteSubmissionId = row?.submission_id ? String(row.submission_id) : null;
  }

  return {
    voteCounts,
    myVoteSubmissionId,
  };
}

function readGuestSessionId(req: NextRequest): { id: string; isNew: boolean } {
  const raw = req.cookies.get(GUEST_VOTER_COOKIE)?.value;
  if (raw && isUuid(raw)) return { id: raw, isNew: false };
  return { id: randomUUID(), isNew: true };
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
  const user = !userErr && userData.user ? userData.user : null;

  if (user) {
    if (submissionId === null) {
      const del = await supabase.from("votes").delete().eq("user_id", user.id).eq("project_id", project.id);
      if (del.error) {
        return NextResponse.json({ ok: false, error: del.error.message }, { status: 400 });
      }
      const payload = await buildVoteResponsePayload(supabase, project.id, {
        kind: "user",
        userId: user.id,
        client: supabase,
      });
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
        user_id: user.id,
        project_id: project.id,
        submission_id: submissionId,
      },
      { onConflict: "user_id,project_id" },
    );

    if (upsert.error) {
      return NextResponse.json({ ok: false, error: upsert.error.message }, { status: 400 });
    }

    const payload = await buildVoteResponsePayload(supabase, project.id, {
      kind: "user",
      userId: user.id,
      client: supabase,
    });
    const res = NextResponse.json({ ok: true, ...payload });
    applyCookies(res);
    return res;
  }

  let admin;
  try {
    admin = createSupabaseServiceRoleClient();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server misconfigured";
    return NextResponse.json({ ok: false, error: message }, { status: 501 });
  }

  const guest = readGuestSessionId(req);

  if (submissionId === null) {
    if (!guest.isNew) {
      const del = await admin.from("anonymous_votes").delete().eq("session_id", guest.id).eq("project_id", project.id);
      if (del.error) {
        return NextResponse.json({ ok: false, error: del.error.message }, { status: 400 });
      }
    }
    const payload = await buildVoteResponsePayload(supabase, project.id, {
      kind: "guest",
      sessionId: guest.id,
      admin,
    });
    const res = NextResponse.json({ ok: true, ...payload });
    if (!guest.isNew) {
      res.cookies.set(GUEST_VOTER_COOKIE, guest.id, guestVoterCookieOptions());
    }
    return res;
  }

  if (typeof submissionId !== "string" || !isUuid(submissionId)) {
    return NextResponse.json({ ok: false, error: "Invalid submissionId" }, { status: 400 });
  }

  const sub = await admin.from("submissions").select("id,project_id").eq("id", submissionId).maybeSingle();
  if (sub.error || !sub.data || String(sub.data.project_id) !== project.id) {
    return NextResponse.json({ ok: false, error: "Submission not in this project" }, { status: 400 });
  }

  const upsert = await admin.from("anonymous_votes").upsert(
    {
      session_id: guest.id,
      project_id: project.id,
      submission_id: submissionId,
    },
    { onConflict: "session_id,project_id" },
  );

  if (upsert.error) {
    return NextResponse.json({ ok: false, error: upsert.error.message }, { status: 400 });
  }

  const payload = await buildVoteResponsePayload(supabase, project.id, {
    kind: "guest",
    sessionId: guest.id,
    admin,
  });
  const res = NextResponse.json({ ok: true, ...payload });
  res.cookies.set(GUEST_VOTER_COOKIE, guest.id, guestVoterCookieOptions());
  return res;
}
