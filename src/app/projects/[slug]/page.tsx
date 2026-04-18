import { Container } from "@/components/ui/Container";
import { ProjectDetailView } from "@/components/projects/detail/ProjectDetailView";
import { getSubmissionsByProjectId } from "@/data/submissions";
import type { SubmissionWithArtist } from "@/components/projects/detail/types";
import { resolveCreatorsForProjects } from "@/lib/catalog/creators";
import { loadProjectBySlug } from "@/lib/catalog/load";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/is-uuid";
import type { Submission } from "@/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = await loadProjectBySlug(slug);
  return { title: project ? project.title : `Project: ${slug}` };
}

async function loadRemoteSubmissionsForProject(projectId: string): Promise<Submission[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return [];

    const q = await supabase
      .from("submissions")
      .select("id,project_id,public_url,vote_count,created_at,user_id")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (q.error) return [];

    const rows = q.data ?? [];
    return rows.map((r) => {
      const id = String(r.id);
      const createdAt = typeof r.created_at === "string" ? r.created_at : new Date().toISOString();
      const voteCount = typeof r.vote_count === "number" ? r.vote_count : 0;
      const imageUrl = typeof r.public_url === "string" ? r.public_url : "";
      const artistId = typeof r.user_id === "string" && r.user_id ? `u:${r.user_id}` : "anon";

      return {
        id,
        projectId: String(r.project_id),
        artistId,
        imageUrl,
        voteCount,
        createdAt,
      };
    });
  } catch {
    return [];
  }
}

export default async function ProjectDetailPlaceholderPage({ params }: Props) {
  const { slug } = await params;
  const project = await loadProjectBySlug(slug);
  if (!project) {
    return (
      <div className="bg-slate-50 py-16">
        <Container>
          <h1 className="text-3xl font-bold text-slate-900">Project not found</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            We couldn&apos;t find a project for <span className="font-mono text-sm">{slug}</span>.
          </p>
        </Container>
      </div>
    );
  }

  const local = getSubmissionsByProjectId(project.id);
  const remote = await loadRemoteSubmissionsForProject(project.id);

  const mergedById = new Map<string, Submission>();
  for (const s of local) mergedById.set(s.id, s);
  for (const s of remote) mergedById.set(s.id, s);
  const merged = [...mergedById.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const creatorByKey = await resolveCreatorsForProjects([
    { creatorId: project.creatorId },
    ...merged.map((s) => ({ creatorId: s.artistId })),
  ]);

  const creator = creatorByKey.get(project.creatorId);
  if (!creator) {
    return (
      <div className="bg-slate-50 py-16">
        <Container>
          <h1 className="text-3xl font-bold text-slate-900">Creator not found</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            The creator profile for this project is missing from the catalog.
          </p>
        </Container>
      </div>
    );
  }

  const withArtists: SubmissionWithArtist[] = merged
    .map((s) => {
      const artist = creatorByKey.get(s.artistId);
      if (!artist) {
        if (!isUuid(s.id)) return null;
        return {
          ...s,
          artist: {
            id: s.artistId,
            slug: "community",
            displayName: "Community upload",
            avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=community",
            bio: "",
            joinedAt: s.createdAt,
            stats: {
              totalSubmissions: 0,
              totalVotesReceived: 0,
              selectedWins: 0,
              projectsJoined: 0,
            },
          },
        };
      }
      return { ...s, artist };
    })
    .filter(Boolean) as SubmissionWithArtist[];

  let favoritedSubmissionIds: string[] = [];
  let myVoteSubmissionId: string | null = null;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        const uuidIds = withArtists.map((s) => s.id).filter(isUuid);
        if (user && uuidIds.length > 0) {
          const fav = await supabase.from("favorite_submissions").select("submission_id").in("submission_id", uuidIds);
          if (!fav.error) {
            favoritedSubmissionIds = (fav.data ?? []).map((r) => String(r.submission_id)).filter(Boolean);
          }
        }

        if (user) {
          const v = await supabase
            .from("votes")
            .select("submission_id")
            .eq("project_id", project.id)
            .maybeSingle();
          if (!v.error && v.data?.submission_id) {
            myVoteSubmissionId = String(v.data.submission_id);
          }
        }
      }
    } catch {
      favoritedSubmissionIds = [];
      myVoteSubmissionId = null;
    }
  }

  return (
    <ProjectDetailView
      model={{ project, creator, submissions: withArtists }}
      favoritedSubmissionIds={favoritedSubmissionIds}
      initialMyVoteSubmissionId={myVoteSubmissionId}
    />
  );
}
