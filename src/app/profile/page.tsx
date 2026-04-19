import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
import { Container } from "@/components/ui/Container";
import { mapProfileFromDb } from "@/lib/profile-map";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  fetchWinningSubmissionCoverUrlByProjectId,
  overlayWinningSubmissionCovers,
} from "@/lib/catalog/winning-submission-cover";
import type {
  ProfileProjectSummary,
  ProfileSavedSubmissionSummary,
  ProfileSubmissionSummary,
} from "@/types/user-profile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your profile",
  description: "Edit your ArtNoCap profile, avatar, and bio. View your projects, submissions, and saved favorites.",
};

function mapProjectRow(r: Record<string, unknown>): ProfileProjectSummary {
  return {
    id: String(r.id),
    slug: String(r.slug),
    title: String(r.title),
    coverImageUrl: String(r.cover_image_url),
    endsAt: new Date(String(r.ends_at)).toISOString(),
  };
}

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return (
      <div className="bg-slate-50 py-16">
        <Container className="max-w-lg">
          <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Supabase is not configured in this environment, so profiles cannot load here.
          </p>
        </Container>
      </div>
    );
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    redirect(`/login?returnTo=${encodeURIComponent("/profile")}`);
  }

  const userId = auth.user.id;
  const email = auth.user.email ?? null;

  const { data: row, error: profErr } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, profile_role, style_keywords")
    .eq("id", userId)
    .maybeSingle();

  if (profErr || !row) {
    return (
      <div className="bg-slate-50 py-16">
        <Container className="max-w-lg">
          <h1 className="text-2xl font-bold text-slate-900">Profile unavailable</h1>
          <p className="mt-3 text-sm text-slate-600">
            {profErr?.message ?? "We could not load your profile. Try again after signing in."}
          </p>
        </Container>
      </div>
    );
  }

  const profile = mapProfileFromDb(row as Record<string, unknown>);

  const { data: projRows } = await supabase
    .from("projects")
    .select("id, slug, title, cover_image_url, ends_at")
    .eq("creator_user_id", userId)
    .order("created_at", { ascending: false });

  let myProjects: ProfileProjectSummary[] = (projRows ?? []).map((r) =>
    mapProjectRow(r as Record<string, unknown>),
  );
  if (myProjects.length > 0) {
    const covers = await fetchWinningSubmissionCoverUrlByProjectId(
      supabase,
      myProjects.map((p) => p.id),
    );
    myProjects = overlayWinningSubmissionCovers(myProjects, covers);
  }

  const { data: subRows } = await supabase
    .from("submissions")
    .select("id, project_id, project_slug, public_url, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const mySubmissions: ProfileSubmissionSummary[] = (subRows ?? []).map((r) => {
    const rec = r as Record<string, unknown>;
    return {
      id: String(rec.id),
      projectId: String(rec.project_id),
      projectSlug: String(rec.project_slug),
      imageUrl: String(rec.public_url),
      createdAt: new Date(String(rec.created_at)).toISOString(),
    };
  });

  const { data: favPRows } = await supabase.from("favorite_projects").select("project_id").eq("user_id", userId);
  const favProjectIds = [...new Set((favPRows ?? []).map((r) => r.project_id).filter(Boolean))] as string[];

  let favoriteProjects: ProfileProjectSummary[] = [];
  if (favProjectIds.length > 0) {
    const { data: fp } = await supabase
      .from("projects")
      .select("id, slug, title, cover_image_url, ends_at")
      .in("id", favProjectIds);
    favoriteProjects = (fp ?? []).map((r) => mapProjectRow(r as Record<string, unknown>));
    const favCovers = await fetchWinningSubmissionCoverUrlByProjectId(
      supabase,
      favoriteProjects.map((p) => p.id),
    );
    favoriteProjects = overlayWinningSubmissionCovers(favoriteProjects, favCovers);
  }

  const { data: favSRows } = await supabase
    .from("favorite_submissions")
    .select("submission_id")
    .eq("user_id", userId);
  const favSubIds = [...new Set((favSRows ?? []).map((r) => r.submission_id).filter(Boolean))] as string[];

  let favoriteSubmissions: ProfileSavedSubmissionSummary[] = [];
  if (favSubIds.length > 0) {
    const { data: fs } = await supabase
      .from("submissions")
      .select("id, project_slug, public_url")
      .in("id", favSubIds);
    favoriteSubmissions = (fs ?? []).map((r) => {
      const rec = r as Record<string, unknown>;
      return {
        id: String(rec.id),
        projectSlug: String(rec.project_slug),
        imageUrl: String(rec.public_url),
      };
    });
  }

  return (
    <ProfilePageClient
      email={email}
      initialProfile={profile}
      myProjects={myProjects}
      mySubmissions={mySubmissions}
      favoriteProjects={favoriteProjects}
      favoriteSubmissions={favoriteSubmissions}
    />
  );
}
