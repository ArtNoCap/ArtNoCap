import { NextRequest, NextResponse } from "next/server";
import { getProjectBySlug } from "@/data/projects";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route";

export const runtime = "nodejs";

const bucket = "submission-images";
const maxBytes = 10 * 1024 * 1024;

export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;

  const project = getProjectBySlug(slug);
  if (!project) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  let supabase;
  try {
    supabase = createSupabaseServiceRoleClient();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Supabase is not configured";
    return NextResponse.json({ ok: false, error: message }, { status: 501 });
  }

  const { supabase: authed, applyCookies } = createSupabaseRouteHandlerClient(req);
  const { data: userData, error: userError } = await authed.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ ok: false, error: "You must be logged in to submit." }, { status: 401 });
  }
  const userId = userData.user.id;

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ ok: false, error: "Expected multipart/form-data" }, { status: 415 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const rights = form.get("rightsConfirmed");

  if (rights !== "true") {
    return NextResponse.json({ ok: false, error: "Rights confirmation required" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, error: "Invalid image type" }, { status: 400 });
  }
  if (file.size <= 0 || file.size > maxBytes) {
    return NextResponse.json({ ok: false, error: "Invalid file size" }, { status: 400 });
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/jpeg"
          ? "jpg"
          : null;
  if (!ext) {
    return NextResponse.json({ ok: false, error: "Only PNG, JPG, or WEBP are supported" }, { status: 400 });
  }

  const objectPath = `${project.id}/${userId}/${crypto.randomUUID()}.${ext}`;

  const bytes = Buffer.from(await file.arrayBuffer());
  const upload = await supabase.storage.from(bucket).upload(objectPath, bytes, {
    contentType: file.type,
    upsert: false,
    cacheControl: "3600",
  });

  if (upload.error) {
    return NextResponse.json({ ok: false, error: upload.error.message }, { status: 400 });
  }

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  const publicUrl = pub.publicUrl;

  const insert = await supabase.from("submissions").insert({
    project_id: project.id,
    project_slug: project.slug,
    submitter_key: userId,
    user_id: userId,
    image_path: objectPath,
    public_url: publicUrl,
    vote_count: 0,
  }).select("id").single();

  if (insert.error) {
    // Best-effort cleanup if the DB insert fails after upload succeeded.
    await supabase.storage.from(bucket).remove([objectPath]);

    const code = (insert.error as { code?: string } | null)?.code;
    if (code === "23505") {
      return NextResponse.json(
        { ok: false, error: "You already submitted to this project." },
        { status: 409 },
      );
    }

    return NextResponse.json({ ok: false, error: insert.error.message }, { status: 400 });
  }

  const json = NextResponse.json({
    ok: true,
    submissionId: insert.data.id,
    publicUrl,
    imagePath: objectPath,
  });
  applyCookies(json);

  return json;
}
