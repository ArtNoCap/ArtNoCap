"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProjectHeader } from "@/components/projects/detail/ProjectHeader";
import { ProjectTabs, type ProjectTabId } from "@/components/projects/detail/ProjectTabs";
import { SubmissionCard } from "@/components/projects/detail/SubmissionCard";
import { SortDropdown, type SubmissionSortId } from "@/components/projects/detail/SortDropdown";
import type { ProjectDetailModel } from "@/components/projects/detail/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { isUuid } from "@/lib/is-uuid";

function sumVotes(votes: Record<string, number>) {
  return Object.values(votes).reduce((acc, n) => acc + n, 0);
}

export function ProjectDetailView({
  model,
  favoritedSubmissionIds = [],
  initialMyVoteSubmissionId = null,
}: {
  model: ProjectDetailModel;
  favoritedSubmissionIds?: string[];
  initialMyVoteSubmissionId?: string | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<ProjectTabId>("submissions");
  const [sort, setSort] = useState<SubmissionSortId>("top");
  const [selectedId, setSelectedId] = useState<string | null>(initialMyVoteSubmissionId ?? null);
  const [voteBusy, setVoteBusy] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedId(initialMyVoteSubmissionId ?? null);
  }, [initialMyVoteSubmissionId]);

  const [voteCounts, setVoteCounts] = useState<Record<string, number>>(() => {
    const out: Record<string, number> = {};
    for (const s of model.submissions) out[s.id] = s.voteCount;
    return out;
  });

  const submissionCount = model.submissions.length;
  const totalVotes = submissionCount > 0 ? sumVotes(voteCounts) : model.project.voteCount;

  const sorted = useMemo(() => {
    const list = [...model.submissions];
    if (sort === "new") {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    }
    list.sort((a, b) => (voteCounts[b.id] ?? 0) - (voteCounts[a.id] ?? 0));
    return list;
  }, [model.submissions, sort, voteCounts]);

  const favoritedSubmissionIdSet = useMemo(() => new Set(favoritedSubmissionIds), [favoritedSubmissionIds]);

  function onVoteLocal(id: string) {
    setVoteCounts((prev) => {
      const next = { ...prev };
      const already = selectedId === id;
      const prevSelected = selectedId;

      if (already) {
        next[id] = Math.max(0, (next[id] ?? 0) - 1);
        return next;
      }

      if (prevSelected) {
        next[prevSelected] = Math.max(0, (next[prevSelected] ?? 0) - 1);
      }
      next[id] = (next[id] ?? 0) + 1;
      return next;
    });

    setSelectedId((cur) => (cur === id ? null : id));
  }

  async function onVotePersisted(id: string) {
    if (voteBusy) return;
    setVoteBusy(true);
    setVoteError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push(`/login?returnTo=${encodeURIComponent(`/projects/${model.project.slug}`)}`);
        return;
      }

      const nextSelected = selectedId === id ? null : id;
      const res = await fetch(`/api/projects/${model.project.slug}/votes`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ submissionId: nextSelected }),
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        voteCounts?: Record<string, number>;
        myVoteSubmissionId?: string | null;
      } | null;

      if (!res.ok || !json?.ok || !json.voteCounts) {
        setVoteError(json?.error || `Could not save vote (${res.status}).`);
        return;
      }

      setVoteCounts((prev) => ({ ...prev, ...json.voteCounts }));
      setSelectedId(json.myVoteSubmissionId ?? null);
    } finally {
      setVoteBusy(false);
    }
  }

  function onVote(id: string) {
    if (!isUuid(id)) {
      onVoteLocal(id);
      return;
    }
    void onVotePersisted(id);
  }

  return (
    <div className="bg-slate-50 pb-16 pt-10 sm:pt-12">
      <Container>
        <ProjectHeader model={model} totalVotes={totalVotes} submissionCount={submissionCount} />

        <div className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <ProjectTabs value={tab} onChange={setTab} />
            {tab === "submissions" ? <SortDropdown value={sort} onChange={setSort} /> : null}
          </div>

          {tab === "submissions" ? (
            <div className="mt-6 space-y-8">
              {voteError ? (
                <p className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800" role="alert">
                  {voteError}
                </p>
              ) : null}
              {submissionCount === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/80">
                  <p className="text-lg font-bold text-slate-900">No submissions yet</p>
                  <p className="mt-2 text-sm text-slate-600">Be the first to submit a design.</p>
                  <div className="mt-6 flex justify-center">
                    <Button href={`/projects/${model.project.slug}/submit`} variant="primary" size="lg">
                      Submit Artwork
                    </Button>
                  </div>
                </div>
              ) : (
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {sorted.map((s) => (
                    <li key={s.id}>
                      <SubmissionCard
                        submission={s}
                        voteCount={voteCounts[s.id] ?? 0}
                        selected={selectedId === s.id}
                        onVote={() => onVote(s.id)}
                        initialSaved={favoritedSubmissionIdSet.has(s.id)}
                        voteDisabled={voteBusy && isUuid(s.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}

              <section className="rounded-2xl bg-indigo-50/90 px-6 py-6 ring-1 ring-indigo-100 sm:px-8">
                <div className="flex gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                    <ShieldCheck className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">How voting works</h2>
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
                      Vote for your favorite submission. You can change your vote until the project ends.
                      Logged-in users get one vote per project.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          ) : tab === "details" ? (
            <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900">Details</h2>
              <div
                className="prose prose-slate mt-3 max-w-none text-sm"
                // mock HTML content only
                dangerouslySetInnerHTML={{ __html: model.project.detailsHtml }}
              />
            </div>
          ) : tab === "brief" ? (
            <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900">Brief</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{model.project.brief}</p>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900">Activity</h2>
              <p className="mt-3 text-sm text-slate-600">
                Activity feed is coming next (mock events: submissions + votes).
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
