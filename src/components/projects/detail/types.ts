import type { Artist, Project, Submission } from "@/types";

export type SubmissionWithArtist = Submission & { artist: Artist };

export type ProjectDetailModel = {
  project: Project;
  creator: Artist;
  submissions: SubmissionWithArtist[];
};

