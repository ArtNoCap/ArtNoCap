"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import { PROFILE_MAX_SPECIALTIES, PROFILE_MAX_STYLE_KEYWORDS } from "@/data/profile-limits";
import { PROFILE_ROLE_OPTIONS, type ProfileRoleId } from "@/data/profile-roles";
import { parseProfileTagsInput } from "@/lib/profile-tags";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type {
  ProfileProjectSummary,
  ProfileFollowingSummary,
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
  following,
}: {
  email: string | null;
  initialProfile: UserProfileRow;
  myProjects: ProfileProjectSummary[];
  mySubmissions: ProfileSubmissionSummary[];
  favoriteProjects: ProfileProjectSummary[];
  favoriteSubmissions: ProfileSavedSubmissionSummary[];
  following: ProfileFollowingSummary[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(initialProfile.displayName);
  const [bio, setBio] = useState(initialProfile.bio);
  const [profileRole, setProfileRole] = useState<ProfileRoleId>(initialProfile.profileRole);
  const [keywordsInput, setKeywordsInput] = useState(initialProfile.styleKeywords.join(", "));
  const [specialtiesInput, setSpecialtiesInput] = useState(initialProfile.specialties.join(", "));
  const [experienceLevel, setExperienceLevel] = useState<UserProfileRow["experienceLevel"]>(
    initialProfile.experienceLevel,
  );
  const [location, setLocation] = useState(initialProfile.location);
  const [availability, setAvailability] = useState<UserProfileRow["availability"]>(initialProfile.availability);
  const [isPublic, setIsPublic] = useState(initialProfile.isPublic);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfile.avatarUrl);
  const [bannerUrl, setBannerUrl] = useState<string | null>(initialProfile.bannerUrl);

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [bannerBusy, setBannerBusy] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [showSignInEmail, setShowSignInEmail] = useState(false);
  const [archivingSlug, setArchivingSlug] = useState<string | null>(null);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(initialProfile.displayName);
    setBio(initialProfile.bio);
    setProfileRole(initialProfile.profileRole);
    setKeywordsInput(initialProfile.styleKeywords.join(", "));
    setSpecialtiesInput(initialProfile.specialties.join(", "));
    setExperienceLevel(initialProfile.experienceLevel);
    setLocation(initialProfile.location);
    setAvailability(initialProfile.availability);
    setIsPublic(initialProfile.isPublic);
    setAvatarUrl(initialProfile.avatarUrl);
    setBannerUrl(initialProfile.bannerUrl);
  }, [
    initialProfile.displayName,
    initialProfile.bio,
    initialProfile.profileRole,
    initialProfile.avatarUrl,
    initialProfile.styleKeywords,
    initialProfile.specialties,
    initialProfile.experienceLevel,
    initialProfile.location,
    initialProfile.availability,
    initialProfile.isPublic,
    initialProfile.bannerUrl,
  ]);

  const avatarDicebearSeed = encodeURIComponent(initialProfile.id || displayName || "user");
  const fallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarDicebearSeed}`;

  const removeProjectFromSite = useCallback(
    async (p: ProfileProjectSummary) => {
      if (!p.canRemoveFromSite) return;
      const confirmed = window.confirm(
        `Remove “${p.title}” from ArtNoCap? It will disappear from Browse and the project page. Submissions stay in the archive for a future searchable library.`,
      );
      if (!confirmed) return;
      setArchiveError(null);
      setArchivingSlug(p.slug);
      try {
        const res = await fetch(`/api/projects/${encodeURIComponent(p.slug)}/archive`, { method: "POST" });
        const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
        if (!res.ok || !json?.ok) {
          setArchiveError(json?.error || `Could not remove project (${res.status}).`);
          return;
        }
        router.refresh();
      } finally {
        setArchivingSlug(null);
      }
    },
    [router],
  );

  const onSaveProfile = useCallback(async () => {
    setSaveState("saving");
    setSaveMessage(null);
    const kwParsed = parseProfileTagsInput(keywordsInput, PROFILE_MAX_STYLE_KEYWORDS);
    if (!kwParsed.ok) {
      setSaveState("error");
      setSaveMessage(
        kwParsed.reason === "too_many"
          ? `Use at most ${PROFILE_MAX_STYLE_KEYWORDS} style keywords (comma-separated).`
          : "Could not read style keywords.",
      );
      return;
    }
    const spParsed = parseProfileTagsInput(specialtiesInput, PROFILE_MAX_SPECIALTIES);
    if (!spParsed.ok) {
      setSaveState("error");
      setSaveMessage(
        spParsed.reason === "too_many"
          ? `Use at most ${PROFILE_MAX_SPECIALTIES} specialties (comma-separated).`
          : "Could not read specialties.",
      );
      return;
    }
    const styleKeywords = kwParsed.tags;
    const specialties = spParsed.tags;
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          bio: bio.trim(),
          profileRole,
          styleKeywords,
          specialties,
          experienceLevel,
          location: location.trim(),
          availability,
          isPublic,
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
  }, [
    availability,
    isPublic,
    bio,
    displayName,
    experienceLevel,
    keywordsInput,
    location,
    profileRole,
    router,
    specialtiesInput,
  ]);

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

  const onBannerPick = useCallback(() => {
    bannerRef.current?.click();
  }, []);

  const onBannerFile = useCallback(
    async (list: FileList | null) => {
      const file = list?.[0];
      if (!file) return;
      setBannerError(null);
      setBannerBusy(true);
      try {
        const fd = new FormData();
        fd.set("file", file);
        const res = await fetch("/api/profile/banner", { method: "POST", body: fd });
        const json = (await res.json().catch(() => null)) as
          | { ok?: boolean; error?: string; bannerUrl?: string }
          | null;
        if (!res.ok || !json?.ok || !json.bannerUrl) {
          throw new Error(json?.error || "Upload failed");
        }
        setBannerUrl(json.bannerUrl);
        router.refresh();
      } catch (e) {
        setBannerError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setBannerBusy(false);
        if (bannerRef.current) bannerRef.current.value = "";
      }
    },
    [router],
  );

  return (
    <div className="bg-slate-50 pb-20 pt-10 sm:pt-12">
      <Container>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your profile</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your sign-in email isn&apos;t shown here by default. Use the button below only if you need a
            reminder—avoid sharing your screen while it&apos;s visible.
          </p>
          {email ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Button
                type="button"
                variant="secondary"
                size="compact"
                className="w-fit"
                onClick={() => setShowSignInEmail((v) => !v)}
                aria-expanded={showSignInEmail}
                aria-controls="profile-signin-email"
              >
                {showSignInEmail ? "Hide sign-in email" : "Display sign-in email"}
              </Button>
              {showSignInEmail ? (
                <output
                  id="profile-signin-email"
                  className="block rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm text-slate-900 ring-1 ring-slate-200/80"
                  aria-live="polite"
                >
                  {email}
                </output>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-10 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-5">
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900">Photo & presence</h2>
              <p className="mt-1 text-xs text-slate-500">Avatar is public on the site once you participate.</p>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Banner image</p>
                    <p className="mt-1 text-xs text-slate-500">Shows at the top of your public artist page.</p>
                  </div>
                  <div className="shrink-0">
                    <input
                      ref={bannerRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={(e) => void onBannerFile(e.target.files)}
                    />
                    <Button type="button" variant="secondary" onClick={onBannerPick} disabled={bannerBusy}>
                      <ImageIcon className="h-4 w-4" aria-hidden />
                      {bannerBusy ? "Uploading…" : bannerUrl ? "Change banner" : "Upload banner"}
                    </Button>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/80">
                  <div className="relative aspect-[16/5]">
                    {bannerUrl ? (
                      <Image
                        src={bannerUrl}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 720px, 100vw"
                        className="object-cover"
                        unoptimized={bannerUrl.includes("dicebear")}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/40" />
                    {bannerBusy ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40">
                        <Loader2 className="h-8 w-8 animate-spin text-white" aria-hidden />
                      </div>
                    ) : null}
                  </div>
                </div>

                {bannerError ? (
                  <p className="mt-3 text-sm text-red-600" role="alert">
                    {bannerError}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-slate-500">PNG, JPG, or WEBP · up to 1MB · recommended 3:1</p>
              </div>

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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="min-w-0 flex-1">
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
                  <fieldset className="shrink-0 sm:pt-0.5">
                    <legend className="text-sm font-semibold text-slate-900">Public profile</legend>
                    <p className="sr-only">Choose whether you appear on Discover Artists and your public artist page.</p>
                    <div
                      className="mt-2 inline-flex rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200/80"
                      role="group"
                      aria-label="Profile visibility"
                    >
                      <button
                        type="button"
                        onClick={() => setIsPublic(true)}
                        aria-pressed={isPublic}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                          isPublic ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80" : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Public
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPublic(false)}
                        aria-pressed={!isPublic}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                          !isPublic ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80" : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Private
                      </button>
                    </div>
                    <p className="mt-2 max-w-[15rem] text-xs leading-relaxed text-slate-500">
                      {isPublic
                        ? "You appear on Community and anyone can open your public artist page."
                        : "Hidden from Discover Artists and your /artists/… page; your account and projects work as usual."}{" "}
                      <span className="font-medium text-slate-600">Save profile below to apply.</span>
                    </p>
                  </fieldset>
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
                    Comma-separated (e.g. minimal, hand-drawn, retro). Up to {PROFILE_MAX_STYLE_KEYWORDS} tags.
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

                <div>
                  <label htmlFor="profile-specialties" className="text-sm font-semibold text-slate-900">
                    Specialties
                  </label>
                  <p id="profile-specialties-hint" className="mt-1 text-xs text-slate-500">
                    What do you focus on? Comma-separated (e.g. poster design, branding, illustration). Up to{" "}
                    {PROFILE_MAX_SPECIALTIES} tags.
                  </p>
                  <input
                    id="profile-specialties"
                    value={specialtiesInput}
                    onChange={(e) => setSpecialtiesInput(e.target.value)}
                    aria-describedby="profile-specialties-hint"
                    placeholder="branding, poster design, illustration…"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="profile-experience" className="text-sm font-semibold text-slate-900">
                      Experience level
                    </label>
                    <select
                      id="profile-experience"
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value as UserProfileRow["experienceLevel"])}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    >
                      <option value="newcomer">Newcomer</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="pro">Pro</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="profile-availability" className="text-sm font-semibold text-slate-900">
                      Availability
                    </label>
                    <select
                      id="profile-availability"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value as UserProfileRow["availability"])}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    >
                      <option value="open">Open for projects</option>
                      <option value="soon">Available soon</option>
                      <option value="closed">Not available</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="profile-location" className="text-sm font-semibold text-slate-900">
                    Location
                  </label>
                  <p id="profile-location-hint" className="mt-1 text-xs text-slate-500">
                    Optional (e.g. Austin, TX or Remote).
                  </p>
                  <input
                    id="profile-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    maxLength={80}
                    aria-describedby="profile-location-hint"
                    placeholder="Remote"
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
              <p className="mt-1 text-sm text-slate-600">
                Briefs you started. For projects that are still open, you can remove them from the site;
                submissions are kept with an archive stamp for a future searchable artwork library.
              </p>
              {archiveError ? (
                <p className="mt-3 text-sm text-red-600" role="alert">
                  {archiveError}
                </p>
              ) : null}
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
                    <li key={p.id} className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                      <div className="min-w-0 flex-1">
                        <ProjectMiniCard p={p} />
                      </div>
                      {p.canRemoveFromSite ? (
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-fit shrink-0 self-start sm:self-center"
                          disabled={archivingSlug === p.slug}
                          onClick={() => void removeProjectFromSite(p)}
                        >
                          {archivingSlug === p.slug ? "Removing…" : "Remove from site"}
                        </Button>
                      ) : null}
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
              <h2 className="text-lg font-semibold text-slate-900">Following</h2>
              <p className="mt-1 text-sm text-slate-600">Creators you’ve followed.</p>
              {following.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white/80 p-6 text-sm text-slate-600">
                  You’re not following anyone yet.{" "}
                  <Link href="/community" className="font-semibold text-indigo-700 hover:text-indigo-800">
                    Explore the community
                  </Link>{" "}
                  to find creators.
                </p>
              ) : (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {following.map((p) => {
                    const seed = encodeURIComponent(p.id || p.displayName || "creator");
                    const fallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                    return (
                      <li key={p.id}>
                        <Link
                          href={`/artists/${encodeURIComponent(p.slug)}`}
                          className="group flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 transition hover:ring-indigo-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                            <Image
                              src={p.avatarUrl || fallback}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-cover"
                              unoptimized={!p.avatarUrl || p.avatarUrl.includes("dicebear")}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-900 group-hover:text-indigo-700">
                              {p.displayName}
                            </p>
                            <p className="truncate text-xs text-slate-500">View profile</p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
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
