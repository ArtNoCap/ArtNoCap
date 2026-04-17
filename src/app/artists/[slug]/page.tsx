import { Container } from "@/components/ui/Container";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: `Artist · ${slug}` };
}

export default async function ArtistProfilePlaceholderPage({ params }: Props) {
  const { slug } = await params;
  return (
    <div className="bg-slate-50 py-16">
      <Container>
        <h1 className="text-3xl font-bold text-slate-900">Artist profile</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Phase 4 will render <span className="font-mono text-sm">{slug}</span> with stats, tabs,
          badges, and recent submissions.
        </p>
      </Container>
    </div>
  );
}
