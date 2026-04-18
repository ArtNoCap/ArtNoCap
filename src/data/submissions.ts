import type { Submission } from "@/types";

/** Submissions load from Supabase on the project page; no static rows. */
export function getSubmissionsByProjectId(_projectId: string): Submission[] {
  return [];
}
