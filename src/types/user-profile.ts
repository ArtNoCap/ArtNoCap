import type { ProfileRoleId } from "@/data/profile-roles";

export interface UserProfileRow {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  profileRole: ProfileRoleId;
  styleKeywords: string[];
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
