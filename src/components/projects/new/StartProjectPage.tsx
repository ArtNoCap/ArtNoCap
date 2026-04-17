"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CircleHelp,
  ImageIcon,
  Layers,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CONTENT_RATING_OPTIONS } from "@/data/content-ratings";
import { PROJECT_CATEGORY_OPTIONS } from "@/data/project-form";
import { AUTH_RETURN_FLASH_KEY, getMockSession, isMockLoggedIn } from "@/lib/mock-auth";
import { clearNewProjectDraft, loadNewProjectDraft, saveNewProjectDraft } from "@/lib/new-project-draft";
import { slugify } from "@/lib/slug";
import type {
  DimensionUnit,
  NewProjectFormErrors,
  NewProjectFormState,
} from "@/types/create-project";

type ContentRatingOption = (typeof CONTENT_RATING_OPTIONS)[number];

function ContentRatingChoice({
  opt,
  selected,
  onSelect,
}: {
  opt: ContentRatingOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer flex-col gap-1 rounded-2xl border p-4 text-left shadow-sm transition ${
        selected
          ? "border-indigo-200 bg-indigo-50/80 ring-1 ring-indigo-100"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <span className="flex items-start gap-3">
        <input
          type="radio"
          name="contentRating"
          value={opt.id}
          checked={selected}
          onChange={onSelect}
          className="mt-1 h-4 w-4 shrink-0 border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span>
          <span className="block text-base font-bold text-slate-900">{opt.label}</span>
          <span className="mt-0.5 block text-sm font-normal leading-snug text-slate-600">
            {opt.line}
          </span>
        </span>
      </span>
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30";

const labelClass = "block text-sm font-semibold text-slate-900";

const maxCoverBytes = 10 * 1024 * 1024;

const COVER_PICKER_PRESETS: { id: string; label: string; imageUrl: string }[] = [
  {
    id: "abstract-indigo",
    label: "Abstract indigo",
    imageUrl: "https://images.unsplash.com/photo-1526481280695-3c687fd643ed?w=800&h=500&fit=crop",
  },
  {
    id: "soft-gradient",
    label: "Soft gradient",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=500&fit=crop",
  },
  {
    id: "minimal-slate",
    label: "Minimal slate",
    imageUrl: "https://images.unsplash.com/photo-1520697830682-bbb6e85e2b0d?w=800&h=500&fit=crop",
  },
  {
    id: "warm-paper",
    label: "Warm paper",
    imageUrl: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=800&h=500&fit=crop",
  },
  {
    id: "studio-light",
    label: "Studio light",
    imageUrl: "https://images.unsplash.com/photo-1520974735194-6b9f4df2f4a3?w=800&h=500&fit=crop",
  },
  {
    id: "nature-quiet",
    label: "Nature quiet",
    imageUrl: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&h=500&fit=crop",
  },
];

function formatDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function tomorrow(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 24);
}

const DIMENSION_UNIT_OPTIONS: { id: DimensionUnit; label: string; abbr: string }[] = [
  { id: "mm", label: "Millimeters", abbr: "mm" },
  { id: "px", label: "Pixels", abbr: "px" },
  { id: "in", label: "Inches", abbr: "in" },
];

function dimensionUnitWord(unit: DimensionUnit): string {
  if (unit === "mm") return "millimeters";
  if (unit === "px") return "pixels";
  return "inches";
}

function dimensionPlaceholders(unit: DimensionUnit): { width: string; length: string } {
  if (unit === "px") return { width: "1920", length: "1080" };
  if (unit === "in") return { width: "35.4", length: "15.7" };
  return { width: "900", length: "400" };
}

function dimensionsHint(unit: DimensionUnit): string {
  if (unit === "mm") {
    return "Physical print size in millimeters (e.g. 900 × 400 for a deskmat).";
  }
  if (unit === "px") {
    return "Pixel dimensions for digital deliverables (e.g. wallpaper or web graphics).";
  }
  return "Physical size in inches (e.g. for print templates or merch specs).";
}

function validate(values: NewProjectFormState, coverFile: File | null): NewProjectFormErrors {
  const errors: NewProjectFormErrors = {};
  if (values.title.trim().length < 3) {
    errors.title = "Add a clear title (at least 3 characters).";
  }
  if (values.brief.trim().length < 20) {
    errors.brief = "Add a bit more detail so creators understand the goal (at least 20 characters).";
  }
  if (values.categories.length === 0) {
    errors.categories = "Pick at least one category.";
  }
  if (!values.endsAt) {
    errors.endsAt = "Choose a deadline.";
  } else {
    const end = new Date(`${values.endsAt}T23:59:59`);
    const min = tomorrow();
    if (end < min) {
      errors.endsAt = "Deadline should be at least tomorrow.";
    }
  }
  if (!values.rightsConfirmed) {
    errors.rights = "Please confirm you understand how submissions and usage work.";
  }
  if (coverFile && coverFile.size > maxCoverBytes) {
    errors.cover = "Cover image must be 10MB or smaller.";
  }

  const w = values.width.trim();
  const l = values.length.trim();
  if (!w) {
    errors.width = "Required.";
  }
  if (!l) {
    errors.length = "Required.";
  }
  if (w && l) {
    const wn = Number(w);
    const ln = Number(l);
    if (!Number.isFinite(wn) || !Number.isFinite(ln) || wn <= 0 || ln <= 0) {
      errors.dimensions = `Use positive numbers for width and length (${dimensionUnitWord(values.dimensionUnit)}).`;
    }
  }

  if (!values.contentRating) {
    errors.contentRating = "Pick a content rating.";
  }

  return errors;
}

export function StartProjectPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverPreviewUrlRef = useRef<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<NewProjectFormErrors>({});
  const [draftReady, setDraftReady] = useState(false);
  const [resumeMessage, setResumeMessage] = useState<string | null>(null);

  const [values, setValues] = useState<NewProjectFormState>({
    title: "",
    brief: "",
    dimensionUnit: "mm",
    width: "",
    length: "",
    contentRating: null,
    tagsInput: "",
    categories: [],
    endsAt: "",
    rightsConfirmed: false,
  });

  const unitAbbr =
    DIMENSION_UNIT_OPTIONS.find((o) => o.id === values.dimensionUnit)?.abbr ?? "mm";
  const placeholders = dimensionPlaceholders(values.dimensionUnit);

  const suggestedSlug = useMemo(() => slugify(values.title), [values.title]);

  useEffect(() => {
    return () => {
      if (coverPreviewUrlRef.current) {
        URL.revokeObjectURL(coverPreviewUrlRef.current);
        coverPreviewUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const saved = loadNewProjectDraft();
    let message: string | null = null;
    if (typeof window !== "undefined" && sessionStorage.getItem(AUTH_RETURN_FLASH_KEY)) {
      sessionStorage.removeItem(AUTH_RETURN_FLASH_KEY);
      message =
        "You're signed in — your answers are still here. Review the form and tap Submit project when you're ready.";
    } else if (saved) {
      message =
        "We restored your saved answers from this browser. Cover images are not stored yet—re-attach one if you had picked a file.";
    }
    startTransition(() => {
      if (saved) setValues(saved);
      setResumeMessage(message);
      setDraftReady(true);
    });
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    const id = window.setTimeout(() => saveNewProjectDraft(values), 500);
    return () => window.clearTimeout(id);
  }, [values, draftReady]);

  function setCoverPreview(file: File | null) {
    if (coverPreviewUrlRef.current) {
      URL.revokeObjectURL(coverPreviewUrlRef.current);
      coverPreviewUrlRef.current = null;
    }
    setCoverFile(file);
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    coverPreviewUrlRef.current = url;
    setPreviewUrl(url);
  }

  function setCoverPreset(url: string) {
    if (coverPreviewUrlRef.current) {
      URL.revokeObjectURL(coverPreviewUrlRef.current);
      coverPreviewUrlRef.current = null;
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    setCoverFile(null);
    setPreviewUrl(url);
    setErrors((e) => {
      const next = { ...e };
      delete next.cover;
      return next;
    });
  }

  function toggleCategory(id: (typeof PROJECT_CATEGORY_OPTIONS)[number]["id"]) {
    setValues((v) => ({
      ...v,
      categories: v.categories.includes(id)
        ? v.categories.filter((c) => c !== id)
        : [...v.categories, id],
    }));
  }

  function onPickFile() {
    fileInputRef.current?.click();
  }

  function onFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) {
      setCoverPreview(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErrors((e) => ({ ...e, cover: "Please choose a PNG, JPG, or WEBP image." }));
      setCoverPreview(null);
      return;
    }
    setErrors((e) => {
      const next = { ...e };
      delete next.cover;
      return next;
    });
    setCoverPreview(file);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validate(values, coverFile);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    saveNewProjectDraft(values);

    if (!isMockLoggedIn()) {
      router.push(`/login?returnTo=${encodeURIComponent("/projects/new")}`);
      return;
    }

    clearNewProjectDraft();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted) {
    const session = getMockSession();
    return (
      <div className="bg-slate-50 py-10 sm:py-14">
        <Container>
          <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200/80">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <CheckCircle2 className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Nice—your brief is ready to review
                </h1>
                {session ? (
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    Signed in as {session.displayName} (demo session in this browser).
                  </p>
                ) : null}
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  This MVP does not save projects to the server yet. When Supabase is connected,
                  this flow will create your project and take you straight to your project page.
                </p>
                {suggestedSlug ? (
                  <p className="mt-3 text-sm text-slate-600">
                    Preview slug:{" "}
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-800">
                      /projects/{suggestedSlug || "your-project"}
                    </span>
                  </p>
                ) : null}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button href="/browse" variant="primary" className="justify-center px-5 py-3">
                    Browse projects
                  </Button>
                  <Button
                    href="/projects/minimalist-topography-deskmat"
                    variant="secondary"
                    className="justify-center px-5 py-3"
                  >
                    View example project
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
    <div className="bg-slate-50 py-10 sm:py-14">
      <Container>
        <div className="mb-8">
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to projects
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Start a project
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-600">
            Post a design brief as a project. Creators submit finished artwork, and the community
            can vote—one submission per user per project once accounts are enabled.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            {resumeMessage ? (
              <div
                className="flex flex-col gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 text-sm text-indigo-950 sm:flex-row sm:items-center sm:justify-between"
                role="status"
              >
                <p className="leading-relaxed">{resumeMessage}</p>
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0 px-3 py-2 text-xs"
                  onClick={() => setResumeMessage(null)}
                >
                  Dismiss
                </Button>
              </div>
            ) : null}
            <form
              onSubmit={onSubmit}
              className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-8"
              noValidate
            >
              <section className="space-y-4" aria-labelledby="basics-heading">
                <h2 id="basics-heading" className="text-lg font-semibold text-slate-900">
                  Basics
                </h2>
                <div>
                  <label htmlFor="title" className={labelClass}>
                    Project title
                  </label>
                  <p id="title-hint" className="mt-1 text-xs text-slate-500">
                    Keep it specific so the right creators click in.
                  </p>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    autoComplete="off"
                    value={values.title}
                    onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
                    className={`${inputClass} mt-2`}
                    aria-invalid={Boolean(errors.title)}
                    aria-describedby={errors.title ? "title-error title-hint" : "title-hint"}
                  />
                  {errors.title ? (
                    <p id="title-error" className="mt-2 text-sm text-red-600" role="alert">
                      {errors.title}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="brief" className={labelClass}>
                    Short brief
                  </label>
                  <p id="brief-hint" className="mt-1 text-xs text-slate-500">
                    What should the artwork feel like? Mention style, mood, and must-haves.
                  </p>
                  <textarea
                    id="brief"
                    name="brief"
                    rows={5}
                    value={values.brief}
                    onChange={(e) => setValues((v) => ({ ...v, brief: e.target.value }))}
                    className={`${inputClass} mt-2`}
                    aria-invalid={Boolean(errors.brief)}
                    aria-describedby={errors.brief ? "brief-error brief-hint" : "brief-hint"}
                  />
                  {errors.brief ? (
                    <p id="brief-error" className="mt-2 text-sm text-red-600" role="alert">
                      {errors.brief}
                    </p>
                  ) : null}
                </div>

                <fieldset>
                  <legend className={labelClass}>
                    Dimensions <span className="text-red-600">*</span>
                  </legend>
                  <p id="dimensions-hint" className="mt-1 text-xs text-slate-500">
                    {dimensionsHint(values.dimensionUnit)}
                  </p>

                  <div className="mt-4">
                    <p id="dimension-unit-label" className="text-xs font-medium text-slate-600">
                      Unit of measurement
                    </p>
                    <div
                      className="mt-2 flex flex-wrap gap-2"
                      role="radiogroup"
                      aria-labelledby="dimension-unit-label"
                    >
                      {DIMENSION_UNIT_OPTIONS.map((opt) => {
                        const selected = values.dimensionUnit === opt.id;
                        return (
                          <label
                            key={opt.id}
                            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium shadow-sm transition ${
                              selected
                                ? "border-indigo-200 bg-indigo-50/80 text-slate-900 ring-1 ring-indigo-100"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="dimensionUnit"
                              value={opt.id}
                              checked={selected}
                              onChange={() =>
                                setValues((v) => ({ ...v, dimensionUnit: opt.id }))
                              }
                              className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            {opt.label}
                            <span className="text-xs font-normal text-slate-500">({opt.abbr})</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="width" className="text-xs font-medium text-slate-600">
                        Width ({unitAbbr}) <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="width"
                        name="width"
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        required
                        placeholder={placeholders.width}
                        value={values.width}
                        onChange={(e) => setValues((v) => ({ ...v, width: e.target.value }))}
                        className={`${inputClass} mt-1.5`}
                        aria-invalid={Boolean(errors.width || errors.dimensions)}
                        aria-describedby={[
                          "dimensions-hint",
                          errors.width ? "width-error" : "",
                          errors.dimensions ? "dimensions-error" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      />
                      {errors.width ? (
                        <p id="width-error" className="mt-1.5 text-sm text-red-600" role="alert">
                          {errors.width}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <label htmlFor="length" className="text-xs font-medium text-slate-600">
                        Length ({unitAbbr}) <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="length"
                        name="length"
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        required
                        placeholder={placeholders.length}
                        value={values.length}
                        onChange={(e) => setValues((v) => ({ ...v, length: e.target.value }))}
                        className={`${inputClass} mt-1.5`}
                        aria-invalid={Boolean(errors.length || errors.dimensions)}
                        aria-describedby={[
                          "dimensions-hint",
                          errors.length ? "length-error" : "",
                          errors.dimensions ? "dimensions-error" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      />
                      {errors.length ? (
                        <p id="length-error" className="mt-1.5 text-sm text-red-600" role="alert">
                          {errors.length}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {errors.dimensions ? (
                    <p id="dimensions-error" className="mt-2 text-sm text-red-600" role="alert">
                      {errors.dimensions}
                    </p>
                  ) : null}
                </fieldset>

                <fieldset
                  className="mt-8 border-t border-slate-100 pt-6"
                  aria-describedby="content-rating-hint"
                >
                  <legend className={labelClass} id="content-rating-legend">
                    Content rating <span className="text-red-600">*</span>
                  </legend>
                  <p id="content-rating-hint" className="mt-1 text-xs text-slate-500">
                    How wild can submissions go? This helps creators self-select—
                    <span className="font-medium text-slate-600"> not a legal film rating.</span>
                  </p>
                  <div
                    className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                    role="radiogroup"
                    aria-labelledby="content-rating-legend"
                    aria-invalid={errors.contentRating ? true : undefined}
                    aria-errormessage={errors.contentRating ? "content-rating-error" : undefined}
                  >
                    {CONTENT_RATING_OPTIONS.map((opt) => (
                      <ContentRatingChoice
                        key={opt.id}
                        opt={opt}
                        selected={values.contentRating === opt.id}
                        onSelect={() => setValues((v) => ({ ...v, contentRating: opt.id }))}
                      />
                    ))}
                  </div>
                  {errors.contentRating ? (
                    <p id="content-rating-error" className="mt-2 text-sm text-red-600" role="alert">
                      {errors.contentRating}
                    </p>
                  ) : null}
                </fieldset>
              </section>

              <section className="space-y-4 border-t border-slate-100 pt-6" aria-labelledby="tags-heading">
                <h2 id="tags-heading" className="text-lg font-semibold text-slate-900">
                  Tags & categories
                </h2>
                <div>
                  <label htmlFor="tags" className={labelClass}>
                    Keywords
                  </label>
                  <p id="tags-hint" className="mt-1 text-xs text-slate-500">
                    Comma-separated (example: <span className="font-mono">minimal, nature, line-art</span>).
                  </p>
                  <input
                    id="tags"
                    name="tags"
                    type="text"
                    value={values.tagsInput}
                    onChange={(e) => setValues((v) => ({ ...v, tagsInput: e.target.value }))}
                    className={`${inputClass} mt-2`}
                    aria-describedby="tags-hint"
                  />
                  {parseTags(values.tagsInput).length > 0 ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Preview: {parseTags(values.tagsInput).join(" · ")}
                    </p>
                  ) : null}
                </div>

                <fieldset>
                  <legend className={labelClass}>Categories</legend>
                  <p id="categories-hint" className="mt-1 text-xs text-slate-500">
                    Select everything that applies.
                  </p>
                  <div
                    className="mt-3 grid gap-2 sm:grid-cols-2"
                    role="group"
                    aria-describedby="categories-hint"
                  >
                    {PROJECT_CATEGORY_OPTIONS.map((opt) => {
                      const checked = values.categories.includes(opt.id);
                      return (
                        <label
                          key={opt.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm shadow-sm transition ${
                            checked
                              ? "border-indigo-200 bg-indigo-50/60 text-slate-900 ring-1 ring-indigo-100"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            checked={checked}
                            onChange={() => toggleCategory(opt.id)}
                          />
                          <span className="font-medium">{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.categories ? (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {errors.categories}
                    </p>
                  ) : null}
                </fieldset>
              </section>

              <section className="space-y-4 border-t border-slate-100 pt-6" aria-labelledby="timeline-heading">
                <h2 id="timeline-heading" className="text-lg font-semibold text-slate-900">
                  Timeline & cover
                </h2>
                <div>
                  <label htmlFor="endsAt" className={labelClass}>
                    Submission deadline
                  </label>
                  <p id="deadline-hint" className="mt-1 text-xs text-slate-500">
                    Must be at least tomorrow (local time).
                  </p>
                  <input
                    id="endsAt"
                    name="endsAt"
                    type="date"
                    min={formatDateInputValue(tomorrow())}
                    value={values.endsAt}
                    onChange={(e) => setValues((v) => ({ ...v, endsAt: e.target.value }))}
                    className={`${inputClass} mt-2 max-w-xs`}
                    aria-invalid={Boolean(errors.endsAt)}
                    aria-describedby={errors.endsAt ? "endsAt-error deadline-hint" : "deadline-hint"}
                  />
                  {errors.endsAt ? (
                    <p id="endsAt-error" className="mt-2 text-sm text-red-600" role="alert">
                      {errors.endsAt}
                    </p>
                  ) : null}
                </div>

                <div>
                  <p className={labelClass}>Cover image (optional)</p>
                  <p id="cover-hint" className="mt-1 text-xs text-slate-500">
                    PNG, JPG, or WEBP up to 10MB. This becomes the project card image.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(e) => onFileChange(e.target.files)}
                  />
                  {errors.cover ? (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {errors.cover}
                    </p>
                  ) : null}
                  <div className="mt-4 grid gap-4 lg:grid-cols-12 lg:items-start">
                    <button
                      type="button"
                      onClick={onPickFile}
                      aria-describedby="cover-hint"
                      className="group w-full overflow-hidden rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 text-left shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 lg:col-span-7"
                    >
                      <div className="relative aspect-[4/3] w-full bg-slate-100">
                      {previewUrl ? (
                        <>
                          <Image
                            src={previewUrl}
                            alt="Cover preview"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/40 to-transparent p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                                <UploadCloud className="h-4 w-4" aria-hidden />
                                Change cover image
                              </span>
                              <span className="text-xs font-medium text-white/80">
                                Click to replace (PNG/JPG/WEBP, max 10MB)
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
                          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-100 transition group-hover:scale-[1.02]">
                            <ImageIcon className="h-6 w-6" aria-hidden />
                          </span>
                          <div>
                            <p className="text-base font-bold text-slate-900">Add a cover image</p>
                            <p className="mt-1 text-sm text-slate-600">
                              Click to upload{" "}
                              <span className="font-semibold text-slate-800">or</span>{" "}
                              add drag-and-drop later
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-indigo-500/20 transition group-hover:bg-indigo-500">
                            <UploadCloud className="h-4 w-4" aria-hidden />
                            Choose cover image
                          </span>
                        </div>
                      )}
                      </div>
                    </button>

                    <div className="space-y-3 lg:col-span-5">
                      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
                        <p className="text-sm font-semibold text-slate-900">No image yet?</p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          Pick a starter cover—perfect for getting your project posted fast. You can
                          always upload a custom cover later.
                        </p>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {COVER_PICKER_PRESETS.map((opt) => {
                            const active = previewUrl === opt.imageUrl && !coverFile;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setCoverPreset(opt.imageUrl)}
                                className={`group relative overflow-hidden rounded-xl bg-slate-100 shadow-sm ring-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                                  active
                                    ? "ring-indigo-400"
                                    : "ring-slate-200/80 hover:ring-slate-300"
                                }`}
                                aria-pressed={active}
                                title={opt.label}
                              >
                                <div className="relative aspect-[4/3] w-full">
                                  <Image
                                    src={opt.imageUrl}
                                    alt=""
                                    fill
                                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                                    unoptimized
                                  />
                                </div>
                                {active ? (
                                  <div
                                    className="absolute inset-0 ring-inset ring-2 ring-indigo-500/40"
                                    aria-hidden
                                  />
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {previewUrl ? (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-slate-500">
                            Tip: A clear cover helps your project stand out on Browse.
                          </p>
                          <Button
                            type="button"
                            variant="secondary"
                            className="w-full justify-center px-3 py-2 text-xs sm:w-auto"
                            onClick={() => {
                              if (fileInputRef.current) fileInputRef.current.value = "";
                              setCoverPreview(null);
                            }}
                          >
                            Remove cover
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>

              <section className="border-t border-slate-100 pt-6" aria-labelledby="legal-heading">
                <h2 id="legal-heading" className="text-lg font-semibold text-slate-900">
                  Legal & platform rules
                </h2>
                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700 shadow-sm">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={values.rightsConfirmed}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, rightsConfirmed: e.target.checked }))
                    }
                    aria-invalid={Boolean(errors.rights)}
                    aria-describedby="rights-copy"
                  />
                  <span id="rights-copy">
                    <span className="font-semibold text-slate-900">[Placeholder]</span> I confirm my
                    brief is accurate and lawful. I understand creators will upload original finished
                    artwork, and that selected work may be used in line with future ArtNoCap terms
                    (including broad usage rights granted by uploaders to project owners and the
                    platform for project-related promotion).
                  </span>
                </label>
                {errors.rights ? (
                  <p className="mt-2 text-sm text-red-600" role="alert">
                    {errors.rights}
                  </p>
                ) : null}
              </section>

              <div className="border-t border-slate-100 pt-6">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-base text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-violet-500"
                >
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Submit project
                </Button>
                <p className="mt-3 text-center text-xs text-slate-500">
                  Your answers save automatically in this browser while you work. You will be asked
                  to log in or create a profile before the project is submitted—nothing is lost when
                  you return. Supabase will replace this demo flow later.
                </p>
              </div>
            </form>
          </div>

          <aside className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
              <div className="flex items-center gap-2 text-slate-900">
                <CircleHelp className="h-5 w-5 text-indigo-600" aria-hidden />
                <h2 className="text-base font-semibold">Before you publish</h2>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  Pick the right unit (px, mm, or in)—width and length must match how you will judge
                  submissions.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  Call out constraints: text/no text, logos, IP references, or style boundaries.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  Remember: one submission per user per project once accounts ship.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
              <div className="flex items-center gap-2 text-slate-900">
                <Layers className="h-5 w-5 text-indigo-600" aria-hidden />
                <h2 className="text-base font-semibold">What happens next</h2>
              </div>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-600">
                <li>Your project appears on Browse as a project card (not individual submissions).</li>
                <li>Creators submit finished images on the project detail flow.</li>
                <li>Voters help favorites rise; you pick a winner when you are ready.</li>
              </ol>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-6">
              <h2 className="text-base font-semibold text-indigo-950">Payments & ecommerce</h2>
              <p className="mt-2 text-sm leading-relaxed text-indigo-900/90">
                ArtNoCap MVP does not include checkout or payouts. Keep briefs focused on creative
                direction, not purchasing workflows.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
