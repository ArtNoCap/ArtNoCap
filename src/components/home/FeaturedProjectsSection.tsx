import { Container } from "@/components/ui/Container";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { getFeaturedProjects, projects } from "@/data/projects";
import { getArtistById } from "@/data/artists";
import { deriveProjectSpotlights } from "@/lib/spotlight";

export function FeaturedProjectsSection() {
  const featured = getFeaturedProjects(5);
  const spotlightById = deriveProjectSpotlights(projects, new Date());

  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Live projects
            </h2>
            <p className="mt-2 max-w-xl text-slate-600">
              Fresh briefs from the community—browse submissions and voting on each project page.
            </p>
          </div>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {featured.map((project) => {
            const artist = getArtistById(project.creatorId);
            if (!artist) return null;
            const spotlight = spotlightById[project.id];
            return <ProjectCard key={project.id} project={{ ...project, spotlight }} artist={artist} />;
          })}
        </div>
      </Container>
    </section>
  );
}
