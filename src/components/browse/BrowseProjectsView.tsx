"use client";

import { Search, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CONTENT_RATING_OPTIONS } from "@/data/content-ratings";
import { PROJECT_CATEGORY_OPTIONS } from "@/data/project-form";
import type { ProjectCategoryOptionId } from "@/data/project-form";
import { getArtistById } from "@/data/artists";
import { projects } from "@/data/projects";
import {
  type BrowseFilterId,
  type BrowseRatingFilter,
  type BrowseSortId,
  browseKeywordSuggestions,
  filterBrowseProjects,
  refineBrowseProjects,
  sortBrowseProjects,
} from "@/lib/browse-projects";
import { deriveProjectSpotlights } from "@/lib/spotlight";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const PAGE_SIZE = 6;

const FILTERS: { id: BrowseFilterId; label: string }[] = [
  { id: "all", label: "All Projects" },
  { id: "voting", label: "Open for Voting" },
  { id: "ending", label: "Ending Soon" },
  { id: "popular", label: "Popular" },
  { id: "new", label: "Newest" },
];

const SORT_OPTIONS: { id: BrowseSortId; label: string }[] = [
  { id: "popular", label: "Most votes" },
  { id: "newest", label: "Newest first" },
  { id: "ending", label: "Ending soonest" },
  { id: "submissions", label: "Most submissions" },
];

const DATALIST_ID = "browse-search-suggestions";

export function BrowseProjectsView() {
  const [filter, setFilter] = useState<BrowseFilterId>("all");
  const [sort, setSort] = useState<BrowseSortId>("popular");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<ProjectCategoryOptionId[]>([]);
  const [ratingFilter, setRatingFilter] = useState<BrowseRatingFilter>("all");
  const [favoritedByProjectId, setFavoritedByProjectId] = useState<Record<string, boolean>>({});

  const keywordSuggestions = useMemo(() => browseKeywordSuggestions(projects), []);
  const spotlightById = useMemo(() => deriveProjectSpotlights(projects, new Date()), []);

  const processed = useMemo(() => {
    const base = filterBrowseProjects(projects, filter);
    const narrowed = refineBrowseProjects(base, {
      search,
      categoryIds: selectedCategories,
      rating: ratingFilter,
    });
    return sortBrowseProjects(narrowed, sort);
  }, [filter, sort, search, selectedCategories, ratingFilter]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const slice = processed.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const pageProjectIdsKey = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return processed
      .slice(start, start + PAGE_SIZE)
      .map((p) => p.id)
      .join(",");
  }, [processed, currentPage]);

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      const ids = pageProjectIdsKey
        ? pageProjectIdsKey.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      if (ids.length === 0) {
        setFavoritedByProjectId({});
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setFavoritedByProjectId({});
        return;
      }

      const qs = new URLSearchParams({ ids: ids.join(",") });
      const res = await fetch(`/api/favorites/projects?${qs.toString()}`, { method: "GET" });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; favorited?: string[] } | null;
      if (cancelled) return;
      if (!res.ok || !json?.ok || !Array.isArray(json.favorited)) {
        setFavoritedByProjectId({});
        return;
      }

      const next: Record<string, boolean> = {};
      for (const id of ids) next[id] = false;
      for (const id of json.favorited) next[id] = true;
      setFavoritedByProjectId(next);
    }

    void loadFavorites();
    return () => {
      cancelled = true;
    };
  }, [pageProjectIdsKey]);

  const hasRefinements =
    search.trim().length > 0 || selectedCategories.length > 0 || ratingFilter !== "all";

  function toggleCategory(id: ProjectCategoryOptionId) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setPage(1);
  }

  function clearRefinements() {
    setSearch("");
    setSelectedCategories([]);
    setRatingFilter("all");
    setPage(1);
  }

  return (
    <div className="bg-slate-50 pb-16 pt-10 sm:pt-12">
      <Container>
        <header className="flex flex-col gap-6 border-b border-slate-200/80 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Browse Projects
            </h1>
            <p className="mt-2 max-w-2xl text-base text-slate-600">
              Explore active design requests and see what the community is creating. Each card opens
              the project—submissions and voting live on the project page.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor="browse-sort" className="text-sm font-medium text-slate-700">
              Sort by
            </label>
            <select
              id="browse-sort"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as BrowseSortId);
                setPage(1);
              }}
              className="min-w-[11rem] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </header>

        <section className="mt-6 space-y-6" aria-label="Search and filters">
          <div>
            <label htmlFor="browse-search" className="text-sm font-semibold text-slate-900">
              Search
            </label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                id="browse-search"
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                list={DATALIST_ID}
                placeholder="Keywords (e.g. deskmat, japanese, PG-13, UNHINGED)…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                autoComplete="off"
              />
              <datalist id={DATALIST_ID}>
                {keywordSuggestions.map((k) => (
                  <option key={k} value={k} />
                ))}
              </datalist>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Matches title, brief, tags, categories, and content rating labels. Suggestions come from
              active projects.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">Categories</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Tap to include; empty selection means all categories.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PROJECT_CATEGORY_OPTIONS.map((opt) => {
                const active = selectedCategories.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleCategory(opt.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                      active
                        ? "bg-slate-900 text-white ring-1 ring-slate-900"
                        : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="w-full sm:w-auto sm:min-w-[14rem]">
              <label htmlFor="browse-rating" className="text-sm font-semibold text-slate-900">
                Content rating
              </label>
              <select
                id="browse-rating"
                value={ratingFilter}
                onChange={(e) => {
                  setRatingFilter(e.target.value as BrowseRatingFilter);
                  setPage(1);
                }}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:min-w-[14rem]"
              >
                <option value="all">All ratings</option>
                {CONTENT_RATING_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            {hasRefinements ? (
              <Button
                type="button"
                variant="secondary"
                className="inline-flex items-center justify-center gap-2 self-start px-4 py-2.5 text-sm"
                onClick={clearRefinements}
              >
                <X className="h-4 w-4" aria-hidden />
                Clear search & filters
              </Button>
            ) : null}
          </div>
        </section>

        <div
          className="mt-6 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Project status filters"
        >
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setFilter(f.id);
                  setPage(1);
                }}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-600"
                    : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {slice.length === 0 ? (
          <p className="mt-10 text-center text-sm text-slate-600">
            No projects match these filters. Try clearing search, categories, or rating—or pick a
            different status chip.
          </p>
        ) : (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {slice.map((project) => {
              const artist = getArtistById(project.creatorId);
              if (!artist) return null;
              const spotlight = spotlightById[project.id];
                  return (
                <li key={project.id}>
                  <ProjectCard
                    project={{ ...project, spotlight }}
                    artist={artist}
                    initialFavorited={Boolean(favoritedByProjectId[project.id])}
                  />
                </li>
              );
            })}
          </ul>
        )}

        {totalPages > 1 ? (
          <nav
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
            aria-label="Pagination"
          >
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={`inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-lg px-3 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  n === currentPage
                    ? "bg-indigo-600 text-white ring-1 ring-indigo-600"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                aria-current={n === currentPage ? "page" : undefined}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              ›
            </button>
          </nav>
        ) : null}

        <section
          className="mt-14 flex flex-col items-start justify-between gap-4 rounded-2xl bg-indigo-50/90 px-6 py-6 ring-1 ring-indigo-100 sm:flex-row sm:items-center sm:px-8"
          aria-labelledby="browse-cta-heading"
        >
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Users className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 id="browse-cta-heading" className="text-base font-semibold text-slate-900">
                Have a project idea?
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
                Post your project and get custom artwork from our creative community.
              </p>
            </div>
          </div>
          <Button href="/projects/new" variant="primary" className="w-full shrink-0 px-5 py-3 sm:w-auto">
            Start a Project
          </Button>
        </section>
      </Container>
    </div>
  );
}
