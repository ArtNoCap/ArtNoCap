import { Container } from "@/components/ui/Container";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/Button";
import { resolveCreatorsForProjects } from "@/lib/catalog/creators";
import { deriveProjectSpotlights } from "@/lib/spotlight";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadProjectsForApp } from "@/lib/catalog/load";

export async function FeaturedProjectsSection() {
  const catalog = await loadProjectsForApp();
  const featured = catalog.slice(0, 5);
  const spotlightById = deriveProjectSpotlights(catalog, new Date());
  const artistByCreatorId = await resolveCreatorsForProjects(featured);

  const favoritedIds = new Set<string>();
  try {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user && featured.length > 0) {
        const ids = featured.map((p) => p.id);
        const fav = await supabase.from("favorite_projects").select("project_id").in("project_id", ids);
        if (!fav.error) {
          for (const row of fav.data ?? []) {
            if (row?.project_id) favoritedIds.add(row.project_id);
          }
        }
      }
    }
  } catch {
    // Supabase not configured, or favorites tables not migrated yet — cards still render.
  }

  if (featured.length === 0) {
    return (
      <section className="bg-slate-50 py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/80">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">No projects yet</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Publish the first brief—once it is in Supabase it will show up here and on Browse.
            </p>
            <div className="mt-6 flex justify-center">
              <Button href="/projects/new" variant="primary" size="lg">
                Start a project
              </Button>
            </div>
          </div>
        </Container>
      </section>
    );
  }

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
            const artist = artistByCreatorId.get(project.creatorId);
            if (!artist) return null;
            const spotlight = spotlightById[project.id];
            return (
              <ProjectCard
                key={project.id}
                project={{ ...project, spotlight }}
                artist={artist}
                initialFavorited={favoritedIds.has(project.id)}
              />
            );
          })}
        </div>
      </Container>
    </section>
  );
}
