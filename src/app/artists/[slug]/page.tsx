import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicArtistProfileView } from "@/components/artists/PublicArtistProfileView";
import { loadPublicArtistPageData } from "@/lib/artists/load-public-artist-page";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function loadDisplayNameForSlug(slug: string): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, is_public, email_verified")
    .eq("slug", slug)
    .maybeSingle();
  if (profile?.display_name) {
    const visible =
      (profile as { is_public?: boolean; email_verified?: boolean }).is_public === true &&
      (profile as { is_public?: boolean; email_verified?: boolean }).email_verified === true;
    if (visible) return String(profile.display_name);
  }

  const { data: artist } = await supabase.from("artists").select("display_name").eq("slug", slug).maybeSingle();
  if (artist?.display_name) return String(artist.display_name);

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const name = await loadDisplayNameForSlug(slug);
  return { title: name ? `${name} · Artist` : `Artist · ${slug}` };
}

export default async function ArtistProfilePage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const data = await loadPublicArtistPageData(slug);
  if (data.kind === "none") notFound();

  return <PublicArtistProfileView data={data} />;
}
