import type { ProfileRoleId } from "@/data/profile-roles";

export interface UserProfileRow {
  id: string;
  /** URL-safe public handle; unique across profiles (`/artists/:slug`). */
  slug: string;
  displayName: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string;
  profileRole: ProfileRoleId;
  styleKeywords: string[];
  specialties: string[];
  experienceLevel: "newcomer" | "intermediate" | "pro";
  location: string;
  availability: "open" | "soon" | "closed";
  /** Listed on Community and reachable at `/artists/:slug` when true. */
  isPublic: boolean;
  /** True only after email verification (auth.users.email_confirmed_at). */
  emailVerified: boolean;
  /** ISO timestamp from `profiles.created_at` when selected server-side. */
  createdAt?: string;
}

export interface ProfileProjectSummary {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string;
  endsAt: string;
  /** Deadline still in the future — creator may remove the project from the public site. */
  canRemoveFromSite: boolean;
}

export interface ProfileSubmissionSummary {
  id: string;
  projectId: string;
  projectSlug: string;
  imageUrl: string;
  createdAt: string;
}

export interface ProfileSavedSubmissionSummary {
  id: string;
  projectSlug: string;
  imageUrl: string;
}

export interface ProfileFollowingSummary {
  id: string;
  slug: string;
  displayName: string;
  avatarUrl: string | null;
}
