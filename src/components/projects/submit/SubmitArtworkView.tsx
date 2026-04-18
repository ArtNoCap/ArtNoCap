"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getMySubmission, setMySubmission } from "@/lib/local-submissions";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Artist, Project } from "@/types";

const maxBytes = 10 * 1024 * 1024;

type Status = "editing" | "submitted";

export function SubmitArtworkView({
  project,
  creator,
}: {
  project: Project;
  creator: Artist;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("editing");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const alreadySubmitted = useMemo(() => getMySubmission(project.id), [project.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;
        setIsLoggedIn(Boolean(data.user));
      } catch {
        if (!cancelled) setIsLoggedIn(false);
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function onPickFile() {
    fileInputRef.current?.click();
  }

  function onFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose a PNG, JPG, or WEBP image.");
      setPickedFile(null);
      setImageUrl(null);
      return;
    }
    if (file.size > maxBytes) {
      setError("Artwork must be 10MB or smaller.");
      setPickedFile(null);
      setImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPickedFile(file);
    setImageUrl(url);
    setError(null);
  }

  async function onSubmit() {
    if (!authReady) return;
    if (!isLoggedIn) {
      setError("Please log in to submit artwork.");
      return;
    }
    if (alreadySubmitted) {
      setError("This browser already recorded a submission for this project. If that was a mistake, clear site data for ArtNoCap or try another browser profile.");
      return;
    }
    if (!imageUrl) {
      setError("Add an image to submit.");
      return;
    }
    if (!pickedFile) {
      setError("Please upload an image file from your device.");
      return;
    }
    if (!rightsConfirmed) {
      setError("Please confirm the rights & originality checkbox.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", pickedFile);
      fd.set("rightsConfirmed", "true");

      const res = await fetch(`/api/projects/${project.slug}/submissions`, {
        method: "POST",
        body: fd,
      });

      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string; submissionId?: string; publicUrl?: string }
        | null;

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `Upload failed (${res.status})`);
      }

      setMySubmission(project.id, {
        artistId: creator.id,
        id: json.submissionId,
        imageUrl: json.publicUrl ?? "",
      });
      setStatus("submitted");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "submitted") {
    return (
      <div className="bg-slate-50 py-12 sm:py-14">
        <Container>
          <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200/80">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <CheckCircle2 className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Submission received</h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Your artwork was uploaded to Supabase Storage and saved as a submission (requires the
                  Supabase env vars + SQL migrations).
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button
                    href={`/projects/${project.slug}`}
                    variant="primary"
                    className="justify-center px-5 py-3"
                  >
                    Back to voting
                  </Button>
                  <Button href="/browse" variant="secondary" className="justify-center px-5 py-3">
                    Browse projects
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 pb-16 pt-10 sm:pt-12">
      <Container>
        <Link
          href={`/projects/${project.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to voting
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <header className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Submit artwork
              </h1>
              <p className="text-sm leading-relaxed text-slate-600">
                Submitting to{" "}
                <span className="font-semibold text-slate-900">{project.title}</span> by{" "}
                <span className="font-semibold text-slate-900">@{creator.slug}</span>.
              </p>
            </header>

            {alreadySubmitted ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950">
                This browser already recorded a submission for this project. Accounts are limited to one
                submission per project; if you need to retry, clear ArtNoCap site data for this browser.
              </div>
            ) : null}

            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Artwork image</h2>
                  <p id="artwork-hint" className="mt-1 text-xs text-slate-500">
                    PNG, JPG, or WEBP up to 10MB. Click the preview area to upload.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(e) => onFileChange(e.target.files)}
                />
              </div>

              {error ? (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
                  {error}
                </p>
              ) : null}

              <div className="mt-5 grid gap-4 lg:grid-cols-12 lg:items-start">
                <div className="lg:col-span-8">
                  <button
                    type="button"
                    onClick={onPickFile}
                    aria-describedby="artwork-hint"
                    className="group w-full overflow-hidden rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 text-left shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <div className="relative aspect-[4/3] w-full bg-slate-100">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt="Artwork preview"
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 60vw"
                          unoptimized={Boolean(pickedFile)}
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
                          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-100 transition group-hover:scale-[1.02]">
                            <ImageIcon className="h-6 w-6" aria-hidden />
                          </span>
                          <div>
                            <p className="text-base font-bold text-slate-900">Add your submission</p>
                            <p className="mt-1 text-sm text-slate-600">
                              Click to upload an image
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                </div>

                <div className="space-y-3 lg:col-span-4">
                  {imageUrl ? (
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full justify-center"
                      onClick={() => {
                        if (fileInputRef.current) fileInputRef.current.value = "";
                        if (pickedFile) URL.revokeObjectURL(imageUrl);
                        setPickedFile(null);
                        setImageUrl(null);
                      }}
                    >
                      Remove image
                    </Button>
                  ) : null}
                </div>
              </div>

              <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700 shadow-sm">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  checked={rightsConfirmed}
                  onChange={(e) => setRightsConfirmed(e.target.checked)}
                />
                <span>
                  <span className="font-semibold text-slate-900">[Placeholder]</span> I confirm this is
                  my original artwork and I grant usage rights required for this project and for
                  showcasing submissions on ArtNoCap.
                </span>
              </label>

              <div className="mt-6">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-base text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-violet-500"
                  onClick={() => void onSubmit()}
                  disabled={Boolean(alreadySubmitted) || isSubmitting}
                >
                  {isSubmitting ? "Uploading…" : "Submit artwork"}
                </Button>
                <p className="mt-3 text-center text-xs text-slate-500">
                  Uploads require `SUPABASE_SERVICE_ROLE_KEY` on the server plus the SQL migration in
                  `supabase/migrations/`.
                </p>
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
              <h2 className="text-base font-semibold text-slate-900">Project brief</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{project.brief}</p>
              <Button
                href={`/projects/${project.slug}`}
                variant="ghost"
                className="mt-4 w-full justify-center"
              >
                View submissions & vote
              </Button>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-6">
              <h2 className="text-base font-semibold text-indigo-950">Guidelines</h2>
              <ul className="mt-3 space-y-2 text-sm text-indigo-900/90">
                <li>- Follow the dimensions/specs in the project details.</li>
                <li>- Keep it readable at desk distance and avoid tiny text.</li>
                <li>- One submission per user per project (MVP rule).</li>
              </ul>
              <p className="mt-3 text-xs text-indigo-900/80">
                Need the full details? Open the{" "}
                <Link href={`/projects/${project.slug}`} className="font-semibold underline">
                  project page
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}

