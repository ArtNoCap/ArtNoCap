import type { Submission } from "@/types";

/** Mock submissions — used on Project Detail in Phase 3 */
export const submissions: Submission[] = [
  // japanese-waves-deskmat (p6)
  {
    id: "s1",
    projectId: "p6",
    artistId: "a3",
    imageUrl:
      "https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=1200&h=900&fit=crop",
    voteCount: 142,
    createdAt: "2026-04-13T12:10:00.000Z",
  },
  {
    id: "s2",
    projectId: "p6",
    artistId: "a2",
    imageUrl:
      "https://images.unsplash.com/photo-1520975891349-6b42a97a7d34?w=1200&h=900&fit=crop",
    voteCount: 126,
    createdAt: "2026-04-14T09:30:00.000Z",
  },
  {
    id: "s3",
    projectId: "p6",
    artistId: "a5",
    imageUrl:
      "https://images.unsplash.com/photo-1520975869015-88a95c2a7c11?w=1200&h=900&fit=crop",
    voteCount: 98,
    createdAt: "2026-04-15T18:05:00.000Z",
  },
  {
    id: "s4",
    projectId: "p6",
    artistId: "a4",
    imageUrl:
      "https://images.unsplash.com/photo-1520975689589-3f0f0a7b1b2c?w=1200&h=900&fit=crop",
    voteCount: 87,
    createdAt: "2026-04-16T08:40:00.000Z",
  },
  {
    id: "s5",
    projectId: "p6",
    artistId: "a1",
    imageUrl:
      "https://images.unsplash.com/photo-1520975654324-6f8d15b0c1e2?w=1200&h=900&fit=crop",
    voteCount: 76,
    createdAt: "2026-04-16T14:22:00.000Z",
  },
  {
    id: "s6",
    projectId: "p6",
    artistId: "a2",
    imageUrl:
      "https://images.unsplash.com/photo-1520975676767-0dcb2c9b3dbf?w=1200&h=900&fit=crop",
    voteCount: 65,
    createdAt: "2026-04-16T20:00:00.000Z",
  },
  {
    id: "s7",
    projectId: "p6",
    artistId: "a5",
    imageUrl:
      "https://images.unsplash.com/photo-1520975667406-9a2cda3e8c51?w=1200&h=900&fit=crop",
    voteCount: 58,
    createdAt: "2026-04-17T06:35:00.000Z",
  },
  {
    id: "s8",
    projectId: "p6",
    artistId: "a3",
    imageUrl:
      "https://images.unsplash.com/photo-1520975648707-cb4bce9a1df1?w=1200&h=900&fit=crop",
    voteCount: 52,
    createdAt: "2026-04-17T10:15:00.000Z",
  },
];

export function getSubmissionsByProjectId(projectId: string): Submission[] {
  return submissions.filter((s) => s.projectId === projectId);
}
