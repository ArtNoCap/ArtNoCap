import { NextRequest, NextResponse } from "next/server";
import { mapProfileFromDb } from "@/lib/profile-map";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route";

export const runtime = "nodejs";

const bucket = "profile-banners";
const maxBytes = 1 * 1024 * 1024;

export async function POST(req: NextRequest) {
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
  const userId = userData.user.id;

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ ok: false, error: "Expected multipart/form-data" }, { status: 415 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size <= 0) {
    return NextResponse.json({ ok: false, error: "Missing image file" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, error: "File must be an image" }, { status: 400 });
  }
  if (file.size > maxBytes) {
    return NextResponse.json({ ok: false, error: "Image must be 1MB or smaller" }, { status: 400 });
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

  let admin;
  try {
    admin = createSupabaseServiceRoleClient();
  } catch {
    return NextResponse.json({ ok: false, error: "Server storage is not configured" }, { status: 501 });
  }

  const objectPath = `${userId}/${crypto.randomUUID()}.${ext}`;
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
  const publicUrl = pub.publicUrl;

  const upd = await admin
    .from("profiles")
    .update({ banner_url: publicUrl })
    .eq("id", userId)
    .select(
      "id, slug, display_name, avatar_url, banner_url, bio, profile_role, style_keywords, specialties, experience_level, location, availability, is_public, email_verified, created_at",
    )
    .single();

  if (upd.error) {
    await admin.storage.from(bucket).remove([objectPath]);
    return NextResponse.json({ ok: false, error: upd.error.message }, { status: 400 });
  }

  const profile = mapProfileFromDb(upd.data as Record<string, unknown>);
  const res = NextResponse.json({ ok: true, bannerUrl: publicUrl, profile });
  applyCookies(res);
  return res;
}

