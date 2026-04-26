import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.TURNSTILE_SECRET_KEY || "";
  if (!secret) {
    // Allow local dev without keys; production should set this.
    return NextResponse.json({ ok: true, skipped: true });
  }

  const body = (await req.json().catch(() => null)) as { token?: string } | null;
  const token = body?.token?.trim();
  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing captcha token." }, { status: 400 });
  }

  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || undefined;
  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  if (ip) form.set("remoteip", ip);

  const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    cache: "no-store",
  }).catch(() => null);

  if (!resp) {
    return NextResponse.json({ ok: false, error: "Captcha verification failed." }, { status: 502 });
  }

  const json = (await resp.json().catch(() => null)) as { success?: boolean; "error-codes"?: string[] } | null;
  if (!json?.success) {
    return NextResponse.json(
      { ok: false, error: "Captcha failed. Please try again.", codes: json?.["error-codes"] ?? [] },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}

