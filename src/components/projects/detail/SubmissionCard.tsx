"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { VoteButton } from "@/components/projects/detail/VoteButton";
import type { SubmissionWithArtist } from "@/components/projects/detail/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { isUuid } from "@/lib/is-uuid";

export function SubmissionCard({
  submission,
  voteCount,
  selected,
  onVote,
  initialSaved = false,
}: {
  submission: SubmissionWithArtist;
  voteCount: number;
  selected: boolean;
  onVote: () => void;
  initialSaved?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const [saved, setSaved] = useState(initialSaved);
  const [saveBusy, setSaveBusy] = useState(false);
  const canPersistFavorite = isUuid(submission.id);

  useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved, submission.id]);

  async function toggleSaved() {
    if (!canPersistFavorite) return;

    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }

    const next = !saved;
    setSaved(next);
    setSaveBusy(true);
    try {
      const res = await fetch("/api/favorites/submissions", {
        method: next ? "POST" : "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ submissionId: submission.id }),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (!res.ok || !json?.ok) {
        setSaved(!next);
      }
    } finally {
      setSaveBusy(false);
    }
  }

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition ${
        selected
          ? "ring-indigo-300 shadow-md shadow-indigo-600/10"
          : "ring-slate-200/80 hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      {canPersistFavorite ? (
        <button
          type="button"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow-sm ring-1 ring-slate-200/80 backdrop-blur hover:text-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          aria-label={saved ? "Remove submission from saved" : "Save submission"}
          aria-pressed={saved}
          disabled={saveBusy}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void toggleSaved();
          }}
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-rose-500 text-rose-500" : ""}`} aria-hidden />
        </button>
      ) : null}

      <div className="relative aspect-[4/3] w-full bg-slate-100">
        <Image
          src={submission.imageUrl}
          alt={`Artwork submission by ${submission.artist.displayName}`}
          fill
          className={`object-cover transition duration-300 ${selected ? "scale-[1.01]" : "group-hover:scale-[1.02]"}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {selected ? (
          <div className="absolute inset-0 ring-inset ring-2 ring-indigo-500/40" aria-hidden />
        ) : null}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              <Link
                href={`/artists/${submission.artist.slug}`}
                className="hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                @{submission.artist.slug}
              </Link>
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-500">{submission.artist.displayName}</p>
          </div>
          <Badge className={selected ? "bg-indigo-50 text-indigo-700" : ""}>
            {selected ? "Your vote" : "Submission"}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="text-sm font-semibold text-indigo-700">
            <span className="tabular-nums">{voteCount}</span>{" "}
            <span className="text-slate-500">{voteCount === 1 ? "vote" : "votes"}</span>
          </div>
          <VoteButton selected={selected} onClick={onVote} />
        </div>
      </div>
    </article>
  );
}

