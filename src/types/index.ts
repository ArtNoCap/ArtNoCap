import type { ContentRatingId } from "@/data/content-ratings";

/** ISO 8601 date string */
export type ISODateString = string;

export interface Artist {
  id: string;
  slug: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  joinedAt: ISODateString;
  stats: ArtistStats;
}

export interface ArtistStats {
  totalSubmissions: number;
  totalVotesReceived: number;
  selectedWins: number;
  projectsJoined: number;
}

export type ProjectSpotlight = "hot" | "new";

export interface Project {
  id: string;
  slug: string;
  title: string;
  brief: string;
  detailsHtml: string;
  tags: string[];
  creatorId: string;
  categories: string[];
  coverImageUrl: string;
  endsAt: ISODateString;
  submissionCount: number;
  voteCount: number;
  createdAt: ISODateString;
  /** Optional marketing badge on the browse card image */
  spotlight?: ProjectSpotlight;
  /** Content level for the brief (mirrors Start a project form) */
  contentRating: ContentRatingId;
}

export interface Submission {
  id: string;
  projectId: string;
  artistId: string;
  imageUrl: string;
  voteCount: number;
  createdAt: ISODateString;
}

export type ActivityKind = "submission" | "vote" | "comment" | "system";

export interface ActivityItem {
  id: string;
  projectId: string;
  kind: ActivityKind;
  message: string;
  createdAt: ISODateString;
}
