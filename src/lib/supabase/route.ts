import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

export function createSupabaseRouteHandlerClient(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const cookieBag = new Map<string, { name: string; value: string; options?: unknown }>();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieBag.set(name, { name, value, options });
        });
      },
    },
  });

  function applyCookies(res: NextResponse) {
    cookieBag.forEach((c) => {
      res.cookies.set(c.name, c.value, c.options as never);
    });
  }

  return { supabase, applyCookies };
}
