import { Container } from "@/components/ui/Container";
import { SubmitArtworkView } from "@/components/projects/submit/SubmitArtworkView";
import { getArtistById } from "@/data/artists";
import { getProjectBySlug } from "@/data/projects";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: `Submit artwork · ${slug}` };
}

export default async function SubmitPlaceholderPage({ params }: Props) {
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

  return <SubmitArtworkView project={project} creator={creator} />;
}
