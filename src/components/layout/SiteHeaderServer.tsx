import { SiteHeader } from "@/components/layout/SiteHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function SiteHeaderServer() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return <SiteHeader user={null} />;
  }

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  let displayName: string | null = null;
  let avatarUrl: string | null = null;

  if (user) {
    const metaName =
      typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : null;
    displayName = metaName || user.email?.split("@")[0] || "Signed in";

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name,avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.display_name) displayName = profile.display_name;
    if (profile?.avatar_url) avatarUrl = profile.avatar_url;
  }

  const safeDisplayName = displayName ?? "Signed in";

  return <SiteHeader user={user ? { email: user.email, displayName: safeDisplayName, avatarUrl } : null} />;
}
