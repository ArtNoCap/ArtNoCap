"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Images, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDaysLeft } from "@/lib/format";
import type { ProjectDetailModel } from "@/components/projects/detail/types";

function SpecChip({ label }: { label: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/80">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Spec</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{label}</p>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/80">
      <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        {sub ? <p className="mt-0.5 text-xs text-slate-500">{sub}</p> : null}
      </div>
    </div>
  );
}

export function ProjectHeader({
  model,
  totalVotes,
  submissionCount,
}: {
  model: ProjectDetailModel;
  totalVotes: number;
  submissionCount: number;
}) {
  const { project, creator } = model;
  const specLabels = [
    ...project.categories.slice(0, 2),
    ...project.tags.slice(0, 2),
  ].slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/browse"
          className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          ← Back to Projects
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
            <div className="relative aspect-[16/10] w-full bg-slate-100">
              <Image
                src={project.coverImageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {project.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span>by</span>
                <Link
                  href={`/artists/${creator.slug}`}
                  className="font-semibold text-slate-900 hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  @{creator.slug}
                </Link>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                {project.brief}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <Button type="button" variant="secondary" className="w-full justify-center sm:w-auto">
                Share
              </Button>
              <Button
                href={`/projects/${project.slug}/submit`}
                variant="primary"
                size="lg"
                className="w-full justify-center sm:w-auto"
              >
                Submit Artwork
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {specLabels.map((s) => (
              <SpecChip key={s} label={s} />
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Metric
              icon={<Clock className="h-4 w-4" aria-hidden />}
              value={formatDaysLeft(project.endsAt)}
              label="Time left"
              sub={new Date(project.endsAt).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            />
            <Metric
              icon={<Images className="h-4 w-4" aria-hidden />}
              value={String(submissionCount)}
              label="Submissions"
            />
            <Metric
              icon={<ThumbsUp className="h-4 w-4" aria-hidden />}
              value={String(totalVotes)}
              label="Total votes"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

