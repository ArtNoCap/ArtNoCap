"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CommunityFilters, type CommunityFilterState } from "@/components/community/CommunityFilters";
import { CommunityArtistCard } from "@/components/community/CommunityArtistCard";
import { CommunitySortSelect } from "@/components/community/CommunitySortSelect";
import type { CommunityProfile, CommunitySortId } from "@/components/community/types";

function splitCsv(v: string | null): string[] {
  if (!v) return [];
  return v
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 24);
}

function joinCsv(list: string[]): string {
  return list.join(",");
}

function toArrayParam(sp: URLSearchParams, key: string, values: string[]) {
  if (values.length === 0) {
    sp.delete(key);
    return;
  }
  sp.set(key, joinCsv(values));
}

export function CommunityPageClient({
  initialProfiles,
  availableStyles,
  availableSpecialties,
}: {
  initialProfiles: CommunityProfile[];
  availableStyles: string[];
  availableSpecialties: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialState: CommunityFilterState = useMemo(() => {
    const q = searchParams.get("q") ?? "";
    const sort = (searchParams.get("sort") as CommunitySortId | null) ?? "most_active";
    const styles = splitCsv(searchParams.get("styles"));
    const specialties = splitCsv(searchParams.get("specialties"));
    const experienceLevels = splitCsv(searchParams.get("experience")).filter(
      (v): v is CommunityFilterState["experienceLevels"][number] =>
        v === "newcomer" || v === "intermediate" || v === "pro",
    );
    const availability = splitCsv(searchParams.get("availability")).filter(
      (v): v is CommunityFilterState["availability"][number] => v === "open" || v === "soon" || v === "closed",
    );
    const location = searchParams.get("location") ?? "";
    return {
      q,
      sort: sort === "newest" ? "newest" : "most_active",
      styles,
      specialties,
      experienceLevels,
      availability,
      location,
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<CommunityFilterState>(initialState);

  function pushFilters(next: CommunityFilterState) {
    setFilters(next);
    const sp = new URLSearchParams(searchParams.toString());
    if (next.q.trim()) sp.set("q", next.q.trim());
    else sp.delete("q");
    sp.set("sort", next.sort);
    toArrayParam(sp, "styles", next.styles);
    toArrayParam(sp, "specialties", next.specialties);
    toArrayParam(sp, "experience", next.experienceLevels);
    toArrayParam(sp, "availability", next.availability);
    if (next.location.trim()) sp.set("location", next.location.trim());
    else sp.delete("location");
    router.replace(`/community?${sp.toString()}`);
    router.refresh();
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-3">
        <CommunityFilters
          value={filters}
          onChange={pushFilters}
          availableStyles={availableStyles}
          availableSpecialties={availableSpecialties}
        />
      </div>
      <div className="lg:col-span-9">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{initialProfiles.length}</span>{" "}
            {initialProfiles.length === 1 ? "artist" : "artists"}
          </p>
          <CommunitySortSelect value={filters.sort} onChange={(s) => pushFilters({ ...filters, sort: s })} />
        </div>

        {initialProfiles.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200/80">
            <p className="text-base font-semibold text-slate-900">No matches</p>
            <p className="mt-2 text-sm text-slate-600">Try removing a filter or changing your search.</p>
          </div>
        ) : (
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {initialProfiles.map((p) => (
              <li key={p.id}>
                <CommunityArtistCard p={p} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

