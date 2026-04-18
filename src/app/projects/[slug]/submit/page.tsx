import { Container } from "@/components/ui/Container";
import { SubmitArtworkView } from "@/components/projects/submit/SubmitArtworkView";
import { resolveCreator } from "@/lib/catalog/creators";
import { loadProjectBySlug } from "@/lib/catalog/load";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = await loadProjectBySlug(slug);
  return { title: project ? `Submit artwork · ${project.title}` : `Submit artwork · ${slug}` };
}

export default async function SubmitPlaceholderPage({ params }: Props) {
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

  const creator = await resolveCreator(project.creatorId);
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

  return <SubmitArtworkView project={project} creator={creator} />;
}
