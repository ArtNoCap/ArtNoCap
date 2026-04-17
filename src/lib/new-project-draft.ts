import {
  CONTENT_RATING_OPTIONS,
  type ContentRatingId,
} from "@/data/content-ratings";
import {
  PROJECT_CATEGORY_OPTIONS,
  type ProjectCategoryOptionId,
} from "@/data/project-form";
import type { DimensionUnit } from "@/types/create-project";
import type { NewProjectFormState } from "@/types/create-project";

const DRAFT_KEY = "designhub:new-project-draft-v1";

type DraftPayload = {
  v: 1;
  title: string;
  brief: string;
  dimensionUnit: DimensionUnit;
  width: string;
  length: string;
  contentRating: ContentRatingId | null;
  tagsInput: string;
  categories: ProjectCategoryOptionId[];
  endsAt: string;
  rightsConfirmed: boolean;
};

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

const validRatingIds = new Set<string>(CONTENT_RATING_OPTIONS.map((o) => o.id));
const validCategoryIds = new Set<string>(PROJECT_CATEGORY_OPTIONS.map((o) => o.id));

function parseDraft(raw: string): NewProjectFormState | null {
  try {
    const data = JSON.parse(raw) as unknown;
    if (!isRecord(data) || data.v !== 1) return null;
    const dimensionUnit = data.dimensionUnit;
    if (dimensionUnit !== "mm" && dimensionUnit !== "px" && dimensionUnit !== "in") return null;
    const rawCats = Array.isArray(data.categories) ? data.categories : [];
    const categories = rawCats.filter(
      (c): c is ProjectCategoryOptionId =>
        typeof c === "string" && validCategoryIds.has(c),
    );
    let contentRating: ContentRatingId | null = null;
    if (typeof data.contentRating === "string" && validRatingIds.has(data.contentRating)) {
      contentRating = data.contentRating as ContentRatingId;
    }

    return {
      title: typeof data.title === "string" ? data.title : "",
      brief: typeof data.brief === "string" ? data.brief : "",
      dimensionUnit,
      width: typeof data.width === "string" ? data.width : "",
      length: typeof data.length === "string" ? data.length : "",
      contentRating,
      tagsInput: typeof data.tagsInput === "string" ? data.tagsInput : "",
      categories,
      endsAt: typeof data.endsAt === "string" ? data.endsAt : "",
      rightsConfirmed: Boolean(data.rightsConfirmed),
    };
  } catch {
    return null;
  }
}

export function loadNewProjectDraft(): NewProjectFormState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  return parseDraft(raw);
}

export function saveNewProjectDraft(values: NewProjectFormState): void {
  if (typeof window === "undefined") return;
  const payload: DraftPayload = {
    v: 1,
    title: values.title,
    brief: values.brief,
    dimensionUnit: values.dimensionUnit,
    width: values.width,
    length: values.length,
    contentRating: values.contentRating,
    tagsInput: values.tagsInput,
    categories: values.categories,
    endsAt: values.endsAt,
    rightsConfirmed: values.rightsConfirmed,
  };
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
}

export function clearNewProjectDraft(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_KEY);
}
