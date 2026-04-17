import type { ISODateString, Submission } from "@/types";

type StoredSubmission = Pick<Submission, "id" | "projectId" | "artistId" | "imageUrl" | "createdAt"> & {
  voteCount?: number;
};

type StoredIndex = Record<string, StoredSubmission>; // by projectId

const KEY = "artnocap:mySubmissionByProject:v2";

function safeParse(json: string | null): StoredIndex {
  if (!json) return {};
  try {
    const v = JSON.parse(json) as unknown;
    if (!v || typeof v !== "object") return {};
    return v as StoredIndex;
  } catch {
    return {};
  }
}

function nowIso(): ISODateString {
  return new Date().toISOString();
}

export function getMySubmission(projectId: string): StoredSubmission | null {
  if (typeof window === "undefined") return null;
  const index = safeParse(window.localStorage.getItem(KEY));
  return index[projectId] ?? null;
}

export function setMySubmission(
  projectId: string,
  input: { artistId: string; imageUrl: string; id?: string },
): StoredSubmission {
  const submission: StoredSubmission = {
    id: input.id ?? `my-${projectId}`,
    projectId,
    artistId: input.artistId,
    imageUrl: input.imageUrl,
    createdAt: nowIso(),
    voteCount: 0,
  };

  if (typeof window !== "undefined") {
    const index = safeParse(window.localStorage.getItem(KEY));

    // Avoid persisting `blob:` URLs (they won't survive a reload). We still persist the fact that a
    // submission exists to enforce one-per-project in the MVP.
    const toStore: StoredSubmission = submission.imageUrl.startsWith("blob:")
      ? { ...submission, imageUrl: "" }
      : submission;

    index[projectId] = toStore;
    window.localStorage.setItem(KEY, JSON.stringify(index));
  }

  return submission;
}

