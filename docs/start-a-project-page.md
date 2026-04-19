# Start a project page — documentation

This document describes the **Start a project** experience: route, layout, major UI blocks, and behavior. It reflects the implementation in `src/app/projects/new/page.tsx` and `src/components/projects/new/StartProjectPage.tsx`.

---

## Route and access

| Item | Detail |
|------|--------|
| **URL** | `/projects/new` |
| **App Router** | `src/app/projects/new/page.tsx` renders `<StartProjectPage />`. |
| **Auth** | When Supabase is configured, the server checks `getUser()`. If there is no session, the user is redirected to `/login?returnTo=/projects/new`. If Supabase env vars are missing, the page still renders (client submit will redirect to login if needed). |
| **Metadata** | Title: “Start a project”; description mentions creating a design brief on ArtNoCap. |

---

## Overall page shell

- **Background:** `bg-slate-50` with vertical padding (`py-10` / `sm:py-14`).
- **Width:** Content is wrapped in the shared **`Container`** component (consistent horizontal gutters with the rest of the site).
- **Component type:** `StartProjectPage` is a **client component** (`"use client"`) because it manages form state, drafts, file preview, and submit.

---

## Top header (above the grid)

Placed **inside** `Container`, **above** the two-column grid:

1. **Back link** — Text link to `/browse` with a left arrow icon (“Back to projects”). Indigo styling; keyboard focus ring.
2. **Page title** — `h1`: “Start a project” (`text-3xl` / `sm:text-4xl`, bold, slate-900).
3. **Intro paragraph** — Short value prop: post a brief, submissions, voting, one submission per user per project when accounts are enabled. Max width `max-w-2xl`.

---

## Main layout: two-column grid (desktop)

Below the header, the page uses a **12-column CSS grid** with spacing `gap-8`:

| Breakpoint | Behavior |
|------------|----------|
| **Default (mobile / tablet)** | Single column: form first, then sidebar blocks stacked below. |
| **`lg` and up** | Two columns: **main form** `lg:col-span-7`, **aside** `lg:col-span-5`. |

So on large screens the form occupies slightly more than half the row (~58%); the right rail is ~42%.

---

## Left column — main form column

### Optional resume banner

- Shown when `resumeMessage` is set (non-dismissed).
- **Indigo** tinted card: border, background, flex row on `sm+` with “Dismiss” secondary button.
- **Sources of copy:** (1) After login return, session flash: signed in, answers still here. (2) Or restored **local draft** from `localStorage` (with note that cover file is not restored).

### Primary form card

- **Container:** `rounded-2xl bg-white` with shadow and `ring-1 ring-slate-200/80`, padding `p-6` / `sm:p-8`.
- **`noValidate`** on `<form>` — validation is custom in code.
- **Submit error** — If API fails, a red alert strip at the top of the form.

Sections inside the form (top to bottom):

#### 1. “Basics” (`<section aria-labelledby="basics-heading">`)

- **Project title** — Text input; hint; min length 3; error region.
- **Short brief** — Textarea (~5 rows); hint; min length 20; error region.
- **Dimensions** (`<fieldset>`) — Required.
  - Legend: “Dimensions *”
  - Dynamic hint text by unit (mm / px / in).
  - **Unit of measurement** — Horizontal **radio group** (Millimeters, Pixels, Inches) as pill-style labels.
  - **Width / Length** — Two-column grid on `sm+` (`sm:grid-cols-2`); labels include current unit abbreviation; placeholders change by unit; numeric validation with shared “dimensions” error when invalid.
- **Content Level** (`<fieldset>`) — Separated by `border-t` on the section; required **radio group** of three cards (`CONTENT_RATING_OPTIONS`): Standard, Expressive, Unrestricted. Grid: one column on small screens, **three columns** from `md` (`md:grid-cols-3`). Each option is a bordered card with radio + title + description line.

#### 2. “Tags & categories” (`<section>` with top border)

- **Keywords** — Single text input; comma-separated; preview line of parsed tags when non-empty (max 24 tags parsed client-side).
- **Categories** — `fieldset` with checkboxes in a `sm:grid-cols-2` grid; at least one required; options from `PROJECT_CATEGORY_OPTIONS`.

#### 3. “Timeline & mood board” (`<section>` with top border)

- **Submission deadline** — `type="date"`; `min` = tomorrow; validation for “at least tomorrow.”
- **Mood board / example of style (optional)** — Complex sub-layout (still uses `cover*` fields in code/API for the project card image):
  - Hidden file input (`accept` PNG/JPEG/WebP).
  - **Outer grid:** `lg:grid-cols-12` — on large screens splits into **7 + 5** columns.
  - **Left (lg:col-span-7):** Large **clickable** upload area (`aspect-[4/3]`): dashed indigo border, empty state with icon + “Choose images” faux button surface; when preview exists, `next/image` **object-contain** overlay strip “Change mood board image.”
  - **Right (lg:col-span-5):** “No mood board yet?” card with **2×2 grid** of **preset tiles** (`COVER_PICKER_PRESETS`): gradient tiles with labels; selecting sets a remote fallback image URL (no file). Active preset shows ring.
  - **Remove mood board** — When there is a preview, tip text + button clears file + preview.

#### 4. “Legal & platform rules” (`<section>` with top border)

- Single **required checkbox** with placeholder legal copy (rights, uploads, usage). Error if unchecked.

#### 5. Submit row

- Full-width **primary** button: “Submit project” / “Publishing…” with sparkles icon.
- Small muted note: auto-save in browser, must be logged in to publish.

---

## Right column — aside (`<aside>`)

Three stacked cards (`space-y-6`), each `rounded-2xl` white card (last one indigo-tinted border/background):

1. **Before you publish** — `CircleHelp` icon + heading; bullet list with `CheckCircle2` icons (units, constraints, one submission per user).
2. **What happens next** — `Layers` icon; ordered list: browse card, submissions flow, voting / winner.
3. **Payments & ecommerce** — Indigo panel explaining MVP has no checkout/payouts.

On viewports below `lg`, this aside appears **below** the entire form (still full width within `Container`).

---

## Visual and spacing tokens (summary)

- **Page:** slate-50 background; white form/sidebar cards; indigo accents for links, primary actions, and focus rings.
- **Typography:** slate-900 headings; slate-600 body; `text-xs` hints under labels.
- **Spacing:** `space-y-6` between major form sections; `border-t border-slate-100 pt-6` between logical form groups.

---

## Behavior (non-layout)

| Topic | Behavior |
|--------|----------|
| **Draft autosave** | After `draftReady`, `values` debounce **500ms** to `saveNewProjectDraft` in `localStorage` (`src/lib/new-project-draft.ts`). |
| **Slug** | Derived from title via `slugify` on the client (`suggestedSlug`); sent with the create request. |
| **Submit** | Builds `FormData` for `POST /api/projects`: title, brief, slug, endsAt, dimensions, content rating, tags JSON, **category labels** JSON, optional file, `coverFallback` URL when no file. On success: clears draft, navigates to `/projects/[slug]`. |
| **Cover** | Either uploaded file (≤10MB) or preset/fallback URL for card image. |

---

## Accessibility notes

- Section headings use **`aria-labelledby`** where applicable.
- Inputs tie **`aria-invalid`** and **`aria-describedby`** to hints and error ids.
- Content Level uses **`role="radiogroup"`** with legend + `aria-errormessage` when invalid.
- Resume banner uses **`role="status"`**.
- Cover upload target is a **`<button type="button">`** with `aria-describedby` pointing at cover hint.

---

## Files to read in the repo

| File | Role |
|------|------|
| `src/app/projects/new/page.tsx` | Route, metadata, auth gate, renders `StartProjectPage`. |
| `src/components/projects/new/StartProjectPage.tsx` | Full layout, form, validation, submit, aside. |
| `src/types/create-project.ts` | `NewProjectFormState`, `NewProjectFormErrors`. |
| `src/lib/new-project-draft.ts` | Draft persistence keys and shape. |
| `src/data/content-ratings.ts` | Content level options. |
| `src/data/project-form.ts` | Category options. |

---

*Last reviewed against the codebase structure described above; copy in the UI may change independently.*
