"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Container } from "@/components/ui/Container";
import { PROJECT_CATEGORY_OPTIONS, type ProjectCategoryOptionId } from "@/data/project-form";
import type { Artist, Project } from "@/types";
import { refineBrowseProjects, browseKeywordSuggestions } from "@/lib/browse-projects";

type StatusFilter = "all" | "winner_selected" | "all_submitted";

export function ArchiveProjectsView({
  projects,
  creatorsByCreatorId,
}: {
  projects: Project[];
  creatorsByCreatorId: Map<string, Artist>;
}) {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<ProjectCategoryOptionId[]>([]);
  const [status, setStatus] = useState<StatusFilter>("all");

  const keywordSuggestions = useMemo(() => browseKeywordSuggestions(projects), [projects]);

  const filtered = useMemo(() => {
    let out = refineBrowseProjects(projects, { search, categoryIds: selectedCategories, rating: "all" });
    if (status === "winner_selected") out = out.filter((p) => p.submissionCount > 0);
    if (status === "all_submitted") out = out.filter((p) => p.submissionCount > 0);
    return out;
  }, [projects, search, selectedCategories, status]);

  const onToggleCategory = (id: ProjectCategoryOptionId) => {
    setSelectedCategories((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const clearAll = () => {
    setSearch("");
    setSelectedCategories([]);
    setStatus("all");
  };

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Archive</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Project Archive</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
              Completed briefs, final results, and the winning designs.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="sticky top-6 space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-900">Filters</p>
                <Button type="button" variant="ghost" size="compact" className="h-fit px-2" onClick={clearAll}>
                  Clear all
                </Button>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Search</label>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30">
                  <Search className="h-4 w-4 text-slate-400" aria-hidden />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search archived projects…"
                    className="w-full bg-transparent text-sm outline-none"
                    list="archive-search-suggestions"
                  />
                  {search ? (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  ) : null}
                </div>
                <datalist id="archive-search-suggestions">
                  {keywordSuggestions.slice(0, 40).map((k) => (
                    <option key={k} value={k} />
                  ))}
                </datalist>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Status</p>
                <div className="mt-3 space-y-2">
                  {[
                    { id: "all", label: "All archived" },
                    { id: "winner_selected", label: "Winner selected" },
                    { id: "all_submitted", label: "All submitted" },
                  ].map((o) => (
                    <label key={o.id} className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
                      <input
                        type="radio"
                        name="archive-status"
                        value={o.id}
                        checked={status === (o.id as StatusFilter)}
                        onChange={() => setStatus(o.id as StatusFilter)}
                        className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-semibold">{o.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Category</p>
                <div className="mt-3 space-y-2">
                  {PROJECT_CATEGORY_OPTIONS.map((c) => (
                    <label key={c.id} className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(c.id)}
                        onChange={() => onToggleCategory(c.id)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-semibold">{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-9">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-600">
                Showing <span className="font-bold text-slate-900">{filtered.length}</span> projects
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-600">
                No archived projects match your filters.
              </div>
            ) : (
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => {
                  const artist = creatorsByCreatorId.get(p.creatorId);
                  if (!artist) return null;
                  return (
                    <li key={p.id}>
                      <ProjectCard project={p} artist={artist} />
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </Container>
    </div>
  );
}

