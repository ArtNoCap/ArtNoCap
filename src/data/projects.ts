import type { Project } from "@/types";

/** Mock projects — homepage, browse, and detail routes */
export const projects: Project[] = [
  {
    id: "p1",
    slug: "minimalist-topography-deskmat",
    title: "Minimalist Topography Deskmat",
    brief: "Line-based topography, muted palette, no text lockups.",
    detailsHtml:
      "<p>900×400mm print-safe margins. Vector preferred.</p><p>[Legal placeholder] Usage rights TBD per submission terms.</p>",
    tags: ["Deskmat", "900×400mm", "minimal", "line art"],
    creatorId: "a1",
    categories: ["Deskmat / Mouse pad"],
    coverImageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=500&fit=crop",
    endsAt: "2026-05-01T23:59:59.000Z",
    submissionCount: 26,
    voteCount: 184,
    createdAt: "2026-04-01T10:00:00.000Z",
    contentRating: "pg",
  },
  {
    id: "p2",
    slug: "retro-wave-t-shirt",
    title: "Retro Wave T-Shirt",
    brief: "80s sunset grid, limited to 4 spot colors for screen print.",
    detailsHtml:
      "<p>Front print only. Max 4 colors.</p><p>[Legal placeholder] Mockups for portfolio only until selected.</p>",
    tags: ["T-shirt", "screen print", "retro", "4-color"],
    creatorId: "a2",
    categories: ["T-Shirt Design"],
    coverImageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop",
    endsAt: "2026-04-28T23:59:59.000Z",
    submissionCount: 41,
    voteCount: 256,
    createdAt: "2026-04-14T14:30:00.000Z",
    contentRating: "pg-13",
  },
  {
    id: "p3",
    slug: "space-explorer-poster",
    title: "Space Explorer Poster",
    brief: "Vertical poster, cinematic lighting, subtle grain OK.",
    detailsHtml:
      "<p>18×24 aspect. Bleed 0.125in.</p><p>[Legal placeholder] Artist grants broad usage rights upon upload.</p>",
    tags: ["Poster", "18×24", "sci-fi", "cinematic"],
    creatorId: "a3",
    categories: ["Poster"],
    coverImageUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=500&fit=crop",
    endsAt: "2026-05-12T23:59:59.000Z",
    submissionCount: 33,
    voteCount: 198,
    createdAt: "2026-04-05T09:15:00.000Z",
    contentRating: "pg-13",
  },
  {
    id: "p4",
    slug: "cozy-cafe-sticker-pack",
    title: "Cozy Café Sticker Pack",
    brief: "3–5 cohesive stickers, hand-drawn warmth, pastel accents.",
    detailsHtml: "<p>Export as individual PNGs, 300dpi.</p>",
    tags: ["Stickers", "pastel", "illustration", "hand-drawn"],
    creatorId: "a4",
    categories: ["Stickers"],
    coverImageUrl:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=500&fit=crop",
    endsAt: "2026-04-20T23:59:59.000Z",
    submissionCount: 18,
    voteCount: 92,
    createdAt: "2026-04-08T16:45:00.000Z",
    contentRating: "g",
  },
  {
    id: "p5",
    slug: "neon-city-phone-wallpaper",
    title: "Neon City Phone Wallpaper",
    brief: "9:16, neon reflections, readable at small sizes.",
    detailsHtml: "<p>No small text. High contrast safe zones.</p>",
    tags: ["Wallpaper", "9:16", "neon", "mobile"],
    creatorId: "a5",
    categories: ["Digital"],
    coverImageUrl:
      "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&h=500&fit=crop",
    endsAt: "2026-05-03T23:59:59.000Z",
    submissionCount: 54,
    voteCount: 412,
    createdAt: "2026-04-02T11:00:00.000Z",
    contentRating: "r",
  },
  {
    id: "p6",
    slug: "japanese-waves-deskmat",
    title: "Japanese Waves Deskmat",
    brief: "Great wave energy with cherry blossoms—modern or traditional interpretations welcome.",
    detailsHtml: "<p>900×400mm. Vector or high-res raster.</p>",
    tags: ["Deskmat", "900×400mm", "Japanese", "nature"],
    creatorId: "a1",
    categories: ["Deskmat / Mouse pad"],
    coverImageUrl:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=500&fit=crop",
    endsAt: "2026-05-18T23:59:59.000Z",
    submissionCount: 38,
    voteCount: 302,
    createdAt: "2026-04-12T09:00:00.000Z",
    contentRating: "unhinged-mom",
  },
  {
    id: "p7",
    slug: "mountain-sunset-deskmat",
    title: "Mountain Sunset Deskmat",
    brief: "Layered silhouettes, warm gradient sky, no text.",
    detailsHtml: "<p>900×400mm landscape.</p>",
    tags: ["Deskmat", "900×400mm", "landscape", "sunset"],
    creatorId: "a2",
    categories: ["Deskmat / Mouse pad"],
    coverImageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop",
    endsAt: "2026-04-22T23:59:59.000Z",
    submissionCount: 22,
    voteCount: 156,
    createdAt: "2026-03-28T12:00:00.000Z",
    contentRating: "g",
  },
  {
    id: "p8",
    slug: "cyberpunk-alley-mousepad",
    title: "Cyberpunk Alley Mouse Pad",
    brief: "Neon rain, narrow alley, cinematic depth—readable at desk distance.",
    detailsHtml: "<p>Standard desk pad sizes OK.</p>",
    tags: ["Mouse pad", "cyberpunk", "neon", "night"],
    creatorId: "a3",
    categories: ["Deskmat / Mouse pad"],
    coverImageUrl:
      "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&h=500&fit=crop",
    endsAt: "2026-05-08T23:59:59.000Z",
    submissionCount: 47,
    voteCount: 289,
    createdAt: "2026-04-10T18:20:00.000Z",
    contentRating: "unhinged-private",
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getFeaturedProjects(limit = 5): Project[] {
  return projects.slice(0, limit);
}
