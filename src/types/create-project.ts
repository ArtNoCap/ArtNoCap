import type { ContentRatingId } from "@/data/content-ratings";
import type { ProjectCategoryOptionId } from "@/data/project-form";

/** Unit for width × height fields on the new project form (stored as `length` in API for compatibility). */
export type DimensionUnit = "mm" | "px" | "in";

export interface NewProjectFormState {
  title: string;
  brief: string;
  dimensionUnit: DimensionUnit;
  /** Width in the selected `dimensionUnit` (required). */
  width: string;
  /** Length in the selected `dimensionUnit` (required). */
  length: string;
  /** Content level for submissions (required). */
  contentRating: ContentRatingId | null;
  tagsInput: string;
  categories: ProjectCategoryOptionId[];
  endsAt: string;
  rightsConfirmed: boolean;
}

export type NewProjectFormErrors = Partial<
  Record<
    | "title"
    | "brief"
    | "width"
    | "length"
    | "dimensions"
    | "contentRating"
    | "categories"
    | "endsAt"
    | "rights"
    | "cover",
    string
  >
>;
