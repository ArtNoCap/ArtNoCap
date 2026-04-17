import { NextResponse } from "next/server";

/**
 * Lightweight connectivity check for Vercel → Supabase.
 * Does not require database tables to exist yet.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.json(
      { ok: false, error: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY" },
      { status: 500 },
    );
  }

  try {
    // Supabase supports legacy JWT `anon` keys and newer `sb_publishable_...` keys.
    // For publishable keys, prefer `apikey` only (some gateways reject `Authorization: Bearer <publishable>`).
    const isLikelyJwt = anonKey.includes(".") && anonKey.split(".").length === 3;
    const headers: Record<string, string> = { apikey: anonKey };
    if (isLikelyJwt) {
      headers.Authorization = `Bearer ${anonKey}`;
    }

    const res = await fetch(`${url}/rest/v1/`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      host: new URL(url).host,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
