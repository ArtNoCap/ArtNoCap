import { Container } from "@/components/ui/Container";
import { ProjectDetailView } from "@/components/projects/detail/ProjectDetailView";
import { getArtistById } from "@/data/artists";
import { getProjectBySlug } from "@/data/projects";
import { getSubmissionsByProjectId } from "@/data/submissions";
import type { SubmissionWithArtist } from "@/components/projects/detail/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: `Project: ${slug}` };
}

export default async function ProjectDetailPlaceholderPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
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

  const creator = getArtistById(project.creatorId);
  if (!creator) {
    return (
      <div className="bg-slate-50 py-16">
        <Container>
          <h1 className="text-3xl font-bold text-slate-900">Creator not found</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            The creator profile for this project is missing in mock data.
          </p>
        </Container>
      </div>
    );
  }

  const submissions = getSubmissionsByProjectId(project.id);
  const withArtists: SubmissionWithArtist[] = submissions
    .map((s) => {
      const artist = getArtistById(s.artistId);
      if (!artist) return null;
      return { ...s, artist };
    })
    .filter(Boolean) as SubmissionWithArtist[];

  return <ProjectDetailView model={{ project, creator, submissions: withArtists }} />;
}
