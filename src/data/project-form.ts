export const PROJECT_CATEGORY_OPTIONS = [
  { id: "deskmat", label: "Deskmat / Mouse pad" },
  { id: "book-cover", label: "Book cover" },
  { id: "tshirt", label: "T-Shirt Design" },
  { id: "poster", label: "Poster" },
  { id: "stickers", label: "Stickers" },
  { id: "digital", label: "Digital" },
  { id: "logo", label: "Logo / Brand" },
  { id: "other", label: "Other" },
] as const;

export type ProjectCategoryOptionId = (typeof PROJECT_CATEGORY_OPTIONS)[number]["id"];
