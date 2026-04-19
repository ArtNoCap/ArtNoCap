import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route";
import { loadProjectsForApp } from "@/lib/catalog/load";
import { isContentRatingId } from "@/data/content-ratings";
import { generateProjectPlaceholderCoverPng } from "@/lib/projects/placeholder-cover";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

const bucket = "submission-images";
const maxBytes = 10 * 1024 * 1024;

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const projects = await loadProjectsForApp();
  return NextResponse.json({ ok: true, projects });
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ ok: false, error: "Expected multipart/form-data" }, { status: 415 });
  }

  const { supabase: authed, applyCookies } = createSupabaseRouteHandlerClient(req);
  const { data: userData, error: userErr } = await authed.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const userId = userData.user.id;

  const form = await req.formData();
  const title = String(form.get("title") || "").trim();
  const brief = String(form.get("brief") || "").trim();
  const slugRaw = String(form.get("slug") || "").trim();
  const endsAt = String(form.get("endsAt") || "").trim();
  const dimensionUnit = String(form.get("dimensionUnit") || "mm");
  const width = String(form.get("width") || "").trim();
  const length = String(form.get("length") || "").trim();
  const contentRatingRaw = String(form.get("contentRating") || "").trim();
  const file = form.get("file");

  if (title.length < 3) {
    return NextResponse.json({ ok: false, error: "Title is too short" }, { status: 400 });
  }
  if (brief.length < 20) {
    return NextResponse.json({ ok: false, error: "Brief is too short" }, { status: 400 });
  }
  if (!endsAt) {
    return NextResponse.json({ ok: false, error: "Missing endsAt" }, { status: 400 });
  }
  if (!isContentRatingId(contentRatingRaw)) {
    return NextResponse.json({ ok: false, error: "Invalid content level" }, { status: 400 });
  }

  let tags: string[] = [];
  let categories: string[] = [];
  try {
    tags = JSON.parse(String(form.get("tags") || "[]")) as unknown as string[];
    categories = JSON.parse(String(form.get("categories") || "[]")) as unknown as string[];
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid tags or categories JSON" }, { status: 400 });
  }
  if (!Array.isArray(tags)) tags = [];
  if (!Array.isArray(categories) || categories.length === 0) {
    return NextResponse.json({ ok: false, error: "Pick at least one category" }, { status: 400 });
  }

  let baseSlug = slugRaw ? slugify(slugRaw) : slugify(title);
  if (baseSlug.length < 2) baseSlug = `project-${crypto.randomUUID().slice(0, 8)}`;

  let admin;
  try {
    admin = createSupabaseServiceRoleClient();
  } catch {
    return NextResponse.json({ ok: false, error: "Server storage is not configured" }, { status: 501 });
  }

  let publicUrl: string;

  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ ok: false, error: "File must be an image" }, { status: 400 });
    }
    if (file.size > maxBytes) {
      return NextResponse.json({ ok: false, error: "Image must be 10MB or smaller" }, { status: 400 });
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
      return NextResponse.json({ ok: false, error: "Use PNG, JPG, or WEBP" }, { status: 400 });
    }

    const objectPath = `project-covers/${userId}/${crypto.randomUUID()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const upload = await admin.storage.from(bucket).upload(objectPath, bytes, {
      contentType: file.type,
      upsert: false,
      cacheControl: "3600",
    });
    if (upload.error) {
      return NextResponse.json({ ok: false, error: upload.error.message }, { status: 400 });
    }
    const { data: pub } = admin.storage.from(bucket).getPublicUrl(objectPath);
    publicUrl = pub.publicUrl;
  } else {
    let png: ArrayBuffer;
    try {
      png = await generateProjectPlaceholderCoverPng({ title, categories });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Cover generation failed";
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
    const objectPath = `project-covers/${userId}/${crypto.randomUUID()}.png`;
    const upload = await admin.storage.from(bucket).upload(objectPath, Buffer.from(png), {
      contentType: "image/png",
      upsert: false,
      cacheControl: "3600",
    });
    if (upload.error) {
      return NextResponse.json({ ok: false, error: upload.error.message }, { status: 400 });
    }
    const { data: pub } = admin.storage.from(bucket).getPublicUrl(objectPath);
    publicUrl = pub.publicUrl;
  }

  const endsIso = new Date(`${endsAt}T23:59:59.000Z`).toISOString();
  const detailsHtml = `<p><strong>Print size</strong>: ${escapeHtml(width)} × ${escapeHtml(length)} ${escapeHtml(dimensionUnit)}</p><p>${escapeHtml(brief)}</p>`;

  let slug = baseSlug;
  for (let attempt = 0; attempt < 8; attempt++) {
    const projectId = crypto.randomUUID();
    const insert = await authed
      .from("projects")
      .insert({
        id: projectId,
        slug,
        title,
        brief,
        details_html: detailsHtml,
        tags,
        creator_id: null,
        creator_user_id: userId,
        categories,
        cover_image_url: publicUrl,
        ends_at: endsIso,
        submission_count: 0,
        vote_count: 0,
        content_rating: contentRatingRaw,
      })
      .select("slug")
      .single();

    if (!insert.error && insert.data?.slug) {
      const res = NextResponse.json({ ok: true, slug: insert.data.slug, id: projectId });
      applyCookies(res);
      return res;
    }

    const code = (insert.error as { code?: string } | null)?.code;
    if (code === "23505") {
      slug = `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`;
      continue;
    }

    const res = NextResponse.json({ ok: false, error: insert.error?.message ?? "Insert failed" }, { status: 400 });
    applyCookies(res);
    return res;
  }

  return NextResponse.json({ ok: false, error: "Could not allocate a unique slug" }, { status: 409 });
}
