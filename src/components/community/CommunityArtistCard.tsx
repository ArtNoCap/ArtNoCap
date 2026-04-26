"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { CommunityProfile } from "@/components/community/types";

function availabilityLabel(v: CommunityProfile["availability"]): string {
  if (v === "soon") return "Available soon";
  if (v === "closed") return "Not available";
  return "Open for projects";
}

function experienceLabel(v: CommunityProfile["experienceLevel"]): string {
  if (v === "pro") return "Pro";
  if (v === "intermediate") return "Intermediate";
  return "Newcomer";
}

export function CommunityArtistCard({ p }: { p: CommunityProfile }) {
  const href = `/artists/${encodeURIComponent(p.slug)}`;

  const seed = encodeURIComponent(p.id || p.displayName || "creator");
  const fallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

  const topTags = [...new Set([...(p.styleKeywords ?? []), ...(p.specialties ?? [])])]
    .map((t) => String(t).trim())
    .filter(Boolean)
    .slice(0, 4);

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-5 pb-6 pt-5">
        {p.bannerUrl ? (
          <div className="absolute inset-0">
            <Image
              src={p.bannerUrl}
              alt=""
              fill
              sizes="(min-width: 768px) 360px, 100vw"
              className="object-cover"
              unoptimized={p.bannerUrl.includes("dicebear")}
            />
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/30 to-slate-950/70" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(129,140,248,0.22),transparent_55%)]" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white ring-2 ring-white/40 shadow-lg shadow-slate-950/30">
              <Image
                src={p.avatarUrl || fallback}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
                unoptimized={!p.avatarUrl || p.avatarUrl.includes("dicebear")}
              />
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="truncate text-lg font-bold tracking-tight text-white drop-shadow-md sm:text-xl">
                {p.displayName || "Creator"}
              </p>
            </div>
          </div>

          <Badge className="shrink-0 border border-white/20 bg-white/15 text-xs font-bold text-white backdrop-blur-sm">
            {experienceLabel(p.experienceLevel)}
          </Badge>
        </div>
      </div>

      <div className="px-5 pb-5">
        {p.bio ? (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{p.bio}</p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No bio yet.</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge className="bg-emerald-50 text-emerald-700">{availabilityLabel(p.availability)}</Badge>
          {p.location ? <Badge className="bg-slate-100 text-slate-700">{p.location}</Badge> : null}
        </div>

        {topTags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {topTags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-5">
          <Link
            href={href}
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-slate-900/20 transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            View profile
          </Link>
        </div>
      </div>
    </article>
  );
}

