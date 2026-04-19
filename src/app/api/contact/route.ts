import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const maxName = 120;
const maxMessage = 10_000;

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isValidEmail(s: string): boolean {
  if (s.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();

  if (!apiKey || !to || !from) {
    return NextResponse.json(
      { ok: false, error: "Contact form is not configured on the server." },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    name?: string;
    email?: string;
    message?: string;
    website?: string;
  } | null;

  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body.website === "string" && body.website.trim().length > 0) {
    return NextResponse.json({ ok: false, error: "Could not send message." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, maxName) : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, maxMessage) : "";

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "Please provide a valid email address." }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json(
      { ok: false, error: "Please write a bit more in your message (at least 10 characters)." },
      { status: 400 },
    );
  }

  const displayName = name.length > 0 ? name : "ArtNoCap visitor";
  const subject = `ArtNoCap contact: ${displayName.slice(0, 80)}`;
  const text = [`From: ${displayName}`, `Reply-To: ${email}`, "", message].join("\n");
  const html = `
    <p><strong>From:</strong> ${escapeHtml(displayName)}</p>
    <p><strong>Reply-To:</strong> ${escapeHtml(email)}</p>
    <hr style="margin:1rem 0;border:none;border-top:1px solid #e2e8f0" />
    <pre style="white-space:pre-wrap;font-family:system-ui,sans-serif;font-size:14px;line-height:1.5;color:#334155">${escapeHtml(message)}</pre>
  `.trim();

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject,
      text,
      html,
    });
    if (error) {
      return NextResponse.json(
        { ok: false, error: "Could not send your message. Please try again later." },
        { status: 502 },
      );
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not send your message. Please try again later." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
