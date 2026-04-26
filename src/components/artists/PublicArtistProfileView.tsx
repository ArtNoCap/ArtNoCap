"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CalendarDays,
  Image as ImageIcon,
  Layers,
  MapPin,
  MoreHorizontal,
  Share2,
  Star,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { PublicArtistPageData, PublicArtistSelectedWin, PublicArtistSubmission } from "@/lib/artists/load-public-artist-page";

type TabId = "about" | "submissions" | "wins" | "activity";

function formatVotes(n: number): string {
  if (!Number.isFinite(n)) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

function experienceBadge(profile: Extract<PublicArtistPageData, { kind: "profile" }>["profile"]) {
  if (profile.experienceLevel === "intermediate") {
    return { label: "Intermediate", className: "bg-white/10 text-white ring-1 ring-white/20" };
  }
  if (profile.experienceLevel === "newcomer") {
    return { label: "Newcomer", className: "bg-white/10 text-white ring-1 ring-white/20" };
  }
  return null;
}

function StatPill({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex min-w-[9.5rem] flex-1 items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/80">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">{icon}</div>
      <div className="min-w-0">
        <p className="text-lg font-bold tracking-tight text-slate-900">{value}</p>
        <p className="truncate text-xs font-semibold text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function SubmissionStrip({ items }: { items: PublicArtistSubmission[] }) {
  const top = items.slice(0, 8);
  return (
    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
      {top.map((s) => (
        <Link
          key={s.id}
          href={`/projects/${encodeURIComponent(s.projectSlug)}`}
          className="group w-40 shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/80">
            <Image src={s.imageUrl} alt="" fill className="object-cover transition group-hover:scale-[1.02]" sizes="160px" />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">{formatVotes(s.voteCount)}</span>
            <span className="text-xs font-semibold text-indigo-700">▲</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function WinsRow({ wins }: { wins: PublicArtistSelectedWin[] }) {
  const top = wins.slice(0, 6);
  return (
    <div className="-mx-1 grid gap-3 px-1 sm:grid-cols-2 lg:grid-cols-3">
      {top.map((w) => (
        <Link
          key={w.submissionId}
          href={`/projects/${encodeURIComponent(w.projectSlug)}`}
          className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <div className="relative aspect-[16/10] bg-slate-100">
            <Image src={w.imageUrl} alt="" fill className="object-cover transition group-hover:scale-[1.02]" sizes="360px" />
            <div className="absolute left-3 top-3">
              <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">Selected</span>
            </div>
          </div>
          <div className="space-y-1 px-4 py-4">
            <p className="line-clamp-2 text-sm font-bold text-slate-900">{w.projectTitle}</p>
            <p className="text-xs text-slate-500">{new Date(w.createdAt).toLocaleDateString()}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function PublicArtistProfileView({ data }: { data: Exclude<PublicArtistPageData, { kind: "none" }> }) {
  const [tab, setTab] = useState<TabId>("about");

  const bannerUrl = data.kind === "profile" ? data.profile.bannerUrl : null;

  const [followBusy, setFollowBusy] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const canFollow = data.kind === "profile";
  const targetId = data.kind === "profile" ? data.profile.id : null;

  useEffect(() => {
    let cancelled = false;
    if (!canFollow || !targetId) return;
    (async () => {
      const res = await fetch(`/api/follows?ids=${encodeURIComponent(targetId)}`).catch(() => null);
      const json = (await res?.json().catch(() => null)) as { ok?: boolean; following?: string[] } | null;
      if (cancelled) return;
      const following = json?.ok ? (json.following ?? []) : [];
      setIsFollowing(following.includes(targetId));
    })();
    return () => {
      cancelled = true;
    };
  }, [canFollow, targetId]);

  const onToggleFollow = async () => {
    if (!canFollow || !targetId) return;
    setFollowBusy(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch("/api/follows", {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ followingId: targetId }),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; following?: boolean } | null;
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Follow failed");
      }
      setIsFollowing(Boolean(json.following));
    } catch {
      // silent fail for now
    } finally {
      setFollowBusy(false);
    }
  };

  const hero = useMemo(() => {
    if (data.kind === "directory") {
      const a = data.artist;
      return {
        displayName: a.displayName,
        avatarUrl: a.avatarUrl,
        bio: a.bio,
        location: null as string | null,
        joinedLabel: `Joined ${new Date(a.joinedAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}`,
        tags: [] as string[],
        experienceBadge: null as ReturnType<typeof experienceBadge>,
      };
    }

    const p = data.profile;
    const loc = p.location.trim();
    const joined = p.createdAt
      ? `Joined ${new Date(p.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}`
      : "Joined recently";
    const tags = [...new Set([...(p.styleKeywords ?? []), ...(p.specialties ?? [])])]
      .map((t) => String(t).trim())
      .filter(Boolean)
      .slice(0, 8);
    const eb = p.experienceLevel === "pro" ? null : experienceBadge(p);
    return {
      displayName: p.displayName || "Creator",
      avatarUrl: p.avatarUrl,
      bio: p.bio,
      location: loc ? loc : null,
      joinedLabel: joined,
      tags,
      experienceBadge: eb,
    };
  }, [data]);

  const statsBar = useMemo(() => {
    if (data.kind === "profile") {
      return {
        submissions: data.stats.submissions,
        totalVotes: data.stats.totalVotes,
        selectedWins: data.stats.selectedWins,
        projectsJoined: data.stats.projectsJoined,
      };
    }
    return {
      submissions: data.artist.stats.totalSubmissions,
      totalVotes: data.artist.stats.totalVotesReceived,
      selectedWins: data.artist.stats.selectedWins,
      projectsJoined: data.artist.stats.projectsJoined,
    };
  }, [data]);

  const submissions: PublicArtistSubmission[] = data.kind === "profile" ? data.submissions : [];
  const wins: PublicArtistSelectedWin[] = data.kind === "profile" ? data.selectedWins : [];

  const fallbackAvatarSeed =
    data.kind === "profile"
      ? encodeURIComponent(data.profile.id || data.profile.displayName || "creator")
      : encodeURIComponent(data.artist.slug || data.artist.displayName || "creator");
  const fallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${fallbackAvatarSeed}`;

  const avatarSrc = hero.avatarUrl || fallbackAvatar;

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: hero.displayName, url });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-slate-50 pb-16">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900">
        {bannerUrl ? (
          <div className="absolute inset-0">
            <Image
              src={bannerUrl}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              priority
              unoptimized={bannerUrl.includes("dicebear")}
            />
          </div>
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/25 via-slate-950/40 to-slate-950/75" />
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-400/30 blur-3xl" />
          <div className="absolute -right-28 top-10 h-80 w-80 rounded-full bg-fuchsia-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
        </div>

        <Container className="relative py-10 sm:py-12">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0" />
            <div className="flex shrink-0 items-center gap-2">
              <Button type="button" variant="outlineLight" size="compact" onClick={() => void onShare()} aria-label="Share profile">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outlineLight" size="compact" aria-label="More options" disabled title="Coming soon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-end">
              <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32">
                <div className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-white/25" />
                <div className="relative h-full w-full overflow-hidden rounded-full ring-4 ring-white/15">
                  <Image
                    src={avatarSrc}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="128px"
                    unoptimized={!hero.avatarUrl || avatarSrc.includes("dicebear")}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg ring-4 ring-slate-950/30">
                  <Star className="h-4 w-4" fill="currentColor" />
                </div>
              </div>

              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">{hero.displayName}</h1>
                  {data.kind === "profile" && data.profile.experienceLevel === "pro" ? (
                    <span className="rounded-full bg-fuchsia-500/20 px-2.5 py-1 text-xs font-bold text-white ring-1 ring-white/20">
                      Pro
                    </span>
                  ) : null}
                  {data.kind === "profile" && hero.experienceBadge ? (
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${hero.experienceBadge.className}`}>
                      {hero.experienceBadge.label}
                    </span>
                  ) : null}
                </div>

                {hero.bio ? (
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75">{hero.bio}</p>
                ) : (
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">No bio yet.</p>
                )}

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70">
                  {hero.location ? (
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-white/80" />
                      {hero.location}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-white/80" />
                    {hero.joinedLabel}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void onToggleFollow()}
                    disabled={!canFollow || followBusy}
                    title={!canFollow ? "Following is only available for user profiles right now." : undefined}
                    className="cursor-pointer"
                  >
                    {followBusy ? "Saving…" : isFollowing ? "Following" : "+ Follow"}
                  </Button>
                </div>

                {hero.tags.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {hero.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="-mt-8 relative z-10">
        <div className="rounded-3xl bg-white p-4 shadow-lg ring-1 ring-slate-200/70 sm:p-5">
          <div className="flex flex-wrap gap-3">
            <StatPill icon={<ImageIcon className="h-5 w-5" />} value={formatVotes(statsBar.submissions)} label="Submissions" />
            <StatPill icon={<Star className="h-5 w-5" />} value={formatVotes(statsBar.totalVotes)} label="Total votes" />
            <StatPill icon={<Trophy className="h-5 w-5" />} value={String(statsBar.selectedWins)} label="Selected wins" />
            <StatPill icon={<Layers className="h-5 w-5" />} value={String(statsBar.projectsJoined)} label="Projects joined" />
          </div>
        </div>

        <div className="mt-8 border-b border-slate-200">
          <div className="-mb-px flex flex-wrap gap-6">
            {(
              [
                ["about", "About"],
                ["submissions", "Submissions"],
                ["wins", "Selected wins"],
                ["activity", "Activity"],
              ] as const
            ).map(([id, label]) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`border-b-2 pb-3 text-sm font-semibold transition ${
                    active ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {tab === "about" ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-4">
              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
                <h2 className="text-base font-bold text-slate-900">About</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {hero.bio ? hero.bio : "This creator hasn’t added a longer bio yet."}
                </p>
              </section>
            </div>

            <div className="space-y-8 lg:col-span-8">
              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-base font-bold text-slate-900">Recent submissions</h2>
                  <button
                    type="button"
                    className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
                    onClick={() => setTab("submissions")}
                  >
                    View all
                  </button>
                </div>
                {submissions.length > 0 ? (
                  <div className="mt-5">
                    <SubmissionStrip items={submissions} />
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-600">
                    {data.kind === "directory"
                      ? "Directory artists don’t yet show live submission thumbnails here."
                      : "No public submissions yet."}
                  </p>
                )}
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-base font-bold text-slate-900">Selected wins</h2>
                  <button
                    type="button"
                    className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
                    onClick={() => setTab("wins")}
                  >
                    View all
                  </button>
                </div>
                {wins.length > 0 ? (
                  <div className="mt-5">
                    <WinsRow wins={wins} />
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-600">
                    Wins are detected automatically for ended projects: your submission must be the top-voted public entry in
                    that project.
                  </p>
                )}
              </section>
            </div>
          </div>
        ) : null}

        {tab === "submissions" ? (
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-900">Submissions</h2>
              <Badge className="bg-slate-100 text-slate-700">{submissions.length} total</Badge>
            </div>
            {submissions.length > 0 ? (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {submissions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/projects/${encodeURIComponent(s.projectSlug)}`}
                    className="group overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <div className="relative aspect-square">
                      <Image src={s.imageUrl} alt="" fill className="object-cover transition group-hover:scale-[1.02]" sizes="200px" />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700">
                      <span>{formatVotes(s.voteCount)}</span>
                      <span className="text-indigo-700">▲</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">No submissions to show.</p>
            )}
          </div>
        ) : null}

        {tab === "wins" ? (
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-900">Selected wins</h2>
              <Badge className="bg-emerald-50 text-emerald-800">{wins.length} wins</Badge>
            </div>
            {wins.length > 0 ? (
              <div className="mt-6">
                <WinsRow wins={wins} />
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">No wins yet (or no ended projects with a clear top submission).</p>
            )}
          </div>
        ) : null}

        {tab === "activity" ? (
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
            <h2 className="text-base font-bold text-slate-900">Activity</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Activity feeds are not wired up yet. Next step is to log notable events (votes, submissions, selections) into a
              timeline table and render it here.
            </p>
          </div>
        ) : null}
      </Container>
    </div>
  );
}
