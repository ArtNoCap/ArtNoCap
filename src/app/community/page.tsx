import { Container } from "@/components/ui/Container";
import { CommunityPageClient } from "@/components/community/CommunityPageClient";
import { listCommunityProfiles } from "@/lib/community/list-profiles";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Community · Discover Artists",
  description: "Explore artists on ArtNoCap. Search and filter by style, specialty, experience, and availability.",
} as const;

function splitCsv(v: string | null): string[] {
  if (!v) return [];
  return v
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 24);
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    if (Array.isArray(v)) return v[0] ?? null;
    return typeof v === "string" ? v : null;
  };

  const q = get("q") ?? "";
  const sort: "most_active" | "newest" = get("sort") === "newest" ? "newest" : "most_active";
  const styles = splitCsv(get("styles"));
  const specialties = splitCsv(get("specialties"));
  const experienceLevels = splitCsv(get("experience")).filter(
    (v): v is "newcomer" | "intermediate" | "pro" => v === "newcomer" || v === "intermediate" || v === "pro",
  );
  const availability = splitCsv(get("availability")).filter(
    (v): v is "open" | "soon" | "closed" => v === "open" || v === "soon" || v === "closed",
  );
  const location = get("location") ?? "";

  const profiles = await listCommunityProfiles({
    q,
    sort,
    styles,
    specialties,
    experienceLevels,
    availability,
    location,
  });

  // Build option lists from the current dataset (good enough for v1).
  const availableStyles = [...new Set(profiles.flatMap((p) => p.styleKeywords))];
  const availableSpecialties = [...new Set(profiles.flatMap((p) => p.specialties))];

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <Container>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Community</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Discover Artists</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
              Explore talent from the ArtNoCap community. Search by style, specialty, experience, and availability.
            </p>
          </div>
        </div>

        <CommunityPageClient
          initialProfiles={profiles}
          availableStyles={availableStyles}
          availableSpecialties={availableSpecialties}
        />
      </Container>
    </div>
  );
}
