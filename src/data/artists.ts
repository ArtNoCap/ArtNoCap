import type { Artist } from "@/types";

export const artists: Artist[] = [
  {
    id: "a1",
    slug: "alex-rivera",
    displayName: "Alex Rivera",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop",
    bio: "Deskmat enthusiast and vector illustrator.",
    joinedAt: "2025-01-10T12:00:00.000Z",
    stats: {
      totalSubmissions: 42,
      totalVotesReceived: 1280,
      selectedWins: 6,
      projectsJoined: 18,
    },
  },
  {
    id: "a2",
    slug: "sam-cho",
    displayName: "Sam Cho",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop",
    bio: "Sci-fi landscapes and bold color blocking.",
    joinedAt: "2025-03-02T12:00:00.000Z",
    stats: {
      totalSubmissions: 31,
      totalVotesReceived: 940,
      selectedWins: 4,
      projectsJoined: 12,
    },
  },
  {
    id: "a3",
    slug: "jordan-lee",
    displayName: "Jordan Lee",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop",
    bio: "Minimal line art and typography-led pieces.",
    joinedAt: "2024-11-18T12:00:00.000Z",
    stats: {
      totalSubmissions: 58,
      totalVotesReceived: 2104,
      selectedWins: 11,
      projectsJoined: 27,
    },
  },
  {
    id: "a4",
    slug: "taylor-morgan",
    displayName: "Taylor Morgan",
    avatarUrl:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=128&h=128&fit=crop",
    bio: "Abstract textures and experimental palettes.",
    joinedAt: "2025-02-20T12:00:00.000Z",
    stats: {
      totalSubmissions: 19,
      totalVotesReceived: 512,
      selectedWins: 2,
      projectsJoined: 9,
    },
  },
  {
    id: "a5",
    slug: "riley-park",
    displayName: "Riley Park",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop",
    bio: "Character-focused illustration and merch-ready layouts.",
    joinedAt: "2024-09-05T12:00:00.000Z",
    stats: {
      totalSubmissions: 67,
      totalVotesReceived: 3021,
      selectedWins: 9,
      projectsJoined: 33,
    },
  },
];

export function getArtistById(id: string): Artist | undefined {
  return artists.find((a) => a.id === id);
}
