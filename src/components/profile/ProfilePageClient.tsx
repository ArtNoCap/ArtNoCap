"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { PROFILE_ROLE_OPTIONS, type ProfileRoleId } from "@/data/profile-roles";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type {
  ProfileProjectSummary,
  ProfileSavedSubmissionSummary,
  ProfileSubmissionSummary,
  UserProfileRow,
} from "@/types/user-profile";

function ProjectMiniCard({ p }: { p: ProfileProjectSummary }) {
  return (
    <Link
      href={`/projects/${p.slug}`}
      className="group flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm ring-slate-100 transition hover:border-indigo-200 hover:ring-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        <Image src={p.coverImageUrl} alt="" fill className="object-cover" sizes="96px" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-700">{p.title}</p>
        <p className="mt-1 text-xs text-slate-500">Ends {new Date(p.endsAt).toLocaleDateString()}</p>
      </div>
    </Link>
  );
}

function SubmissionThumb({ s, label }: { s: ProfileSubmissionSummary | ProfileSavedSubmissionSummary; label: string }) {
  return (
    <Link
      href={`/projects/${s.projectSlug}`}
      className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      aria-label={`${label}: open project ${s.projectSlug}`}
    >
      <Image src={s.imageUrl} alt="" fill className="object-cover transition group-hover:scale-[1.02]" sizes="120px" />
      <span className="sr-only">{label}</span>
    </Link>
  );
}

export function ProfilePageClient({
  email,
  initialProfile,
  myProjects,
  mySubmissions,
  favoriteProjects,
  favoriteSubmissions,
}: {
  email: string | null;
  initialProfile: UserProfileRow;
  myProjects: ProfileProjectSummary[];
  mySubmissions: ProfileSubmissionSummary[];
  favoriteProjects: ProfileProjectSummary[];
  favoriteSubmissions: ProfileSavedSubmissionSummary[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(initialProfile.displayName);
  const [bio, setBio] = useState(initialProfile.bio);
  const [profileRole, setProfileRole] = useState<ProfileRoleId>(initialProfile.profileRole);
  const [keywordsInput, setKeywordsInput] = useState(initialProfile.styleKeywords.join(", "));
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfile.avatarUrl);

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(initialProfile.displayName);
    setBio(initialProfile.bio);
    setProfileRole(initialProfile.profileRole);
    setKeywordsInput(initialProfile.styleKeywords.join(", "));
    setAvatarUrl(initialProfile.avatarUrl);
  }, [
    initialProfile.displayName,
    initialProfile.bio,
    initialProfile.profileRole,
    initialProfile.avatarUrl,
    initialProfile.styleKeywords,
  ]);

  const seed = encodeURIComponent(displayName || email || "user");
  const fallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

  const onSaveProfile = useCallback(async () => {
    setSaveState("saving");
    setSaveMessage(null);
    const styleKeywords = keywordsInput
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          bio: bio.trim(),
          profileRole,
          styleKeywords,
        }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string; profile?: UserProfileRow }
        | null;
      if (!res.ok || !json?.ok || !json.profile) {
        throw new Error(json?.error || "Save failed");
      }
      setSaveState("saved");
      setSaveMessage(null);
      router.refresh();
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (e) {
      setSaveState("error");
      setSaveMessage(e instanceof Error ? e.message : "Save failed");
    }
  }, [bio, displayName, keywordsInput, profileRole, router]);

  const onAvatarPick = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const onAvatarFile = useCallback(
    async (list: FileList | null) => {
      const file = list?.[0];
      if (!file) return;
      setAvatarError(null);
      setAvatarBusy(true);
      try {
        const fd = new FormData();
        fd.set("file", file);
        const res = await fetch("/api/profile/avatar", { method: "POST", body: fd });
        const json = (await res.json().catch(() => null)) as
          | { ok?: boolean; error?: string; avatarUrl?: string }
          | null;
        if (!res.ok || !json?.ok || !json.avatarUrl) {
          throw new Error(json?.error || "Upload failed");
        }
        setAvatarUrl(json.avatarUrl);
        router.refresh();
      } catch (e) {
        setAvatarError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setAvatarBusy(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [router],
  );

  return (
    <div className="bg-slate-50 pb-20 pt-10 sm:pt-12">
      <Container>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your profile</h1>
          {email ? <p className="mt-1 text-sm text-slate-500">{email}</p> : null}
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-10 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-5">
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900">Photo & presence</h2>
              <p className="mt-1 text-xs text-slate-500">Avatar is public on the site once you participate.</p>

              <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-2 ring-white shadow-md">
                  <Image
                    src={avatarUrl || fallbackAvatar}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="112px"
                    unoptimized={!avatarUrl || avatarUrl.includes("dicebear")}
                  />
                  {avatarBusy ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40">
                      <Loader2 className="h-8 w-8 animate-spin text-white" aria-hidden />
                    </div>
                  ) : null}
                </div>
                <div className="flex w-full flex-col gap-2 sm:pt-1">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(e) => void onAvatarFile(e.target.files)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="justify-center sm:justify-start"
                    onClick={onAvatarPick}
                    disabled={avatarBusy}
                  >
                    <Camera className="h-4 w-4" aria-hidden />
                    {avatarBusy ? "Uploading…" : "Change photo"}
                  </Button>
                  {avatarError ? (
                    <p className="text-sm text-red-600" role="alert">
                      {avatarError}
                    </p>
                  ) : null}
                  <p className="text-xs text-slate-500">PNG, JPG, or WEBP · up to 5MB</p>
                </div>
              </div>

              <div className="mt-8 space-y-5">
                <div>
                  <label htmlFor="profile-display" className="text-sm font-semibold text-slate-900">
                    Display name
                  </label>
                  <input
                    id="profile-display"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={80}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div>
                  <label htmlFor="profile-bio" className="text-sm font-semibold text-slate-900">
                    Short bio
                  </label>
                  <textarea
                    id="profile-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    maxLength={2000}
                    placeholder="Tell others what you make, collect, or care about."
                    className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                  <p className="mt-1 text-xs text-slate-500">{bio.length} / 2000</p>
                </div>

                <fieldset>
                  <legend className="text-sm font-semibold text-slate-900">How do you use ArtNoCap?</legend>
                  <div className="mt-3 space-y-3">
                    {PROFILE_ROLE_OPTIONS.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-sm transition ${
                          profileRole === opt.id
                            ? "border-indigo-300 bg-indigo-50/80 ring-1 ring-indigo-100"
                            : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="profileRole"
                          value={opt.id}
                          checked={profileRole === opt.id}
                          onChange={() => setProfileRole(opt.id)}
                          className="mt-1 h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>
                          <span className="font-semibold text-slate-900">{opt.label}</span>
                          <span className="mt-0.5 block text-slate-600">{opt.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="profile-keywords" className="text-sm font-semibold text-slate-900">
                    Style keywords
                  </label>
                  <p id="profile-keywords-hint" className="mt-1 text-xs text-slate-500">
                    Comma-separated (e.g. minimal, hand-drawn, retro). Up to 24 tags.
                  </p>
                  <input
                    id="profile-keywords"
                    value={keywordsInput}
                    onChange={(e) => setKeywordsInput(e.target.value)}
                    aria-describedby="profile-keywords-hint"
                    placeholder="minimal, editorial, neon…"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="justify-center sm:min-w-[10rem]"
                  onClick={() => void onSaveProfile()}
                  disabled={saveState === "saving"}
                >
                  {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Save profile"}
                </Button>
                {saveMessage ? (
                  <p className="text-sm text-red-600" role="alert">
                    {saveMessage}
                  </p>
                ) : null}
              </div>
            </section>
          </div>

          <div className="space-y-10 lg:col-span-7">
            <section>
              <h2 className="text-lg font-semibold text-slate-900">Your projects</h2>
              <p className="mt-1 text-sm text-slate-600">Briefs you started.</p>
              {myProjects.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white/80 p-6 text-sm text-slate-600">
                  No projects yet.{" "}
                  <Link href="/projects/new" className="font-semibold text-indigo-700 hover:text-indigo-800">
                    Start a project
                  </Link>
                  .
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {myProjects.map((p) => (
                    <li key={p.id}>
                      <ProjectMiniCard p={p} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">Your submissions</h2>
              <p className="mt-1 text-sm text-slate-600">Artwork you uploaded to open projects.</p>
              {mySubmissions.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white/80 p-6 text-sm text-slate-600">
                  No submissions yet.{" "}
                  <Link href="/browse" className="font-semibold text-indigo-700 hover:text-indigo-800">
                    Browse projects
                  </Link>{" "}
                  to join one.
                </p>
              ) : (
                <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
                  {mySubmissions.map((s) => (
                    <li key={s.id}>
                      <SubmissionThumb s={s} label="Your submission" />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">Saved favorites</h2>
              <p className="mt-1 text-sm text-slate-600">Projects and submissions you hearted.</p>

              <h3 className="mt-6 text-sm font-semibold text-slate-800">Projects</h3>
              {favoriteProjects.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">No saved projects.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {favoriteProjects.map((p) => (
                    <li key={p.id}>
                      <ProjectMiniCard p={p} />
                    </li>
                  ))}
                </ul>
              )}

              <h3 className="mt-8 text-sm font-semibold text-slate-800">Submissions</h3>
              {favoriteSubmissions.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">No saved submissions.</p>
              ) : (
                <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
                  {favoriteSubmissions.map((s) => (
                    <li key={s.id}>
                      <SubmissionThumb s={s} label="Saved submission" />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}
