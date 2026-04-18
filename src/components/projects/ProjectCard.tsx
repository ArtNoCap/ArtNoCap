"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Clock, Heart, Images, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { CONTENT_RATING_OPTIONS } from "@/data/content-ratings";
import type { Artist } from "@/types";
import type { Project } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatDaysLeft } from "@/lib/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function SpotlightPill({ kind }: { kind: "hot" | "new" }) {
  if (kind === "hot") {
    return (
      <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
        Hot
      </span>
    );
  }
  return (
    <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
      New
    </span>
  );
}

export function ProjectCard({
  project,
  artist,
  initialFavorited = false,
}: {
  project: Project;
  artist: Artist;
  initialFavorited?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favoriteBusy, setFavoriteBusy] = useState(false);

  useEffect(() => {
    setFavorited(initialFavorited);
  }, [initialFavorited, project.id]);

  const tagPills = project.tags.slice(0, 3);
  const ratingLabel =
    CONTENT_RATING_OPTIONS.find((o) => o.id === project.contentRating)?.label ?? "—";

  async function toggleFavorite() {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }

    const next = !favorited;
    setFavorited(next);
    setFavoriteBusy(true);
    try {
      const res = await fetch("/api/favorites/projects", {
        method: next ? "POST" : "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (!res.ok || !json?.ok) {
        setFavorited(!next);
      }
    } finally {
      setFavoriteBusy(false);
    }
  }

  return (
    <article className="relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-md">
      <button
        type="button"
        className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow-sm ring-1 ring-slate-200/80 backdrop-blur hover:text-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        aria-label={favorited ? "Remove project from saved" : "Save project"}
        aria-pressed={favorited}
        disabled={favoriteBusy}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void toggleFavorite();
        }}
      >
        <Heart
          className={`h-4 w-4 ${favorited ? "fill-rose-500 text-rose-500" : ""}`}
          aria-hidden
        />
      </button>

      <Link
        href={`/projects/${project.slug}`}
        className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
          <Image
            src={project.coverImageUrl}
            alt=""
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {project.spotlight ? (
            <div className="pointer-events-none absolute left-3 top-3 z-10 flex gap-2">
              <SpotlightPill kind={project.spotlight} />
            </div>
          ) : null}
        </div>
        <div className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {project.categories.map((c) => (
              <Badge key={c}>{c}</Badge>
            ))}
            <span
              className="max-w-[10rem] truncate rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold leading-tight text-violet-800 ring-1 ring-violet-100"
              title="Content rating for this brief"
            >
              {ratingLabel}
            </span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-700">
              {project.title}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              by <span className="font-medium text-slate-700">@{artist.slug}</span>
            </p>
          </div>
          {tagPills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tagPills.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" aria-hidden />
              {formatDaysLeft(project.endsAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Images className="h-4 w-4 text-slate-400" aria-hidden />
              {project.submissionCount} submissions
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ThumbsUp className="h-4 w-4 text-slate-400" aria-hidden />
              {project.voteCount} votes
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
            View project
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </Link>
    </article>
  );
}
