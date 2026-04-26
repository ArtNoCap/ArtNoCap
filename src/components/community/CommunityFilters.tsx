"use client";

import { useMemo } from "react";
import type {
  CommunityAvailability,
  CommunityExperienceLevel,
  CommunitySortId,
} from "@/components/community/types";

export type CommunityFilterState = {
  q: string;
  sort: CommunitySortId;
  styles: string[];
  specialties: string[];
  experienceLevels: CommunityExperienceLevel[];
  availability: CommunityAvailability[];
  location: string;
};

function toggleInList<T extends string>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function uniqSorted(list: string[]): string[] {
  return [...new Set(list.map((s) => s.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export function CommunityFilters({
  value,
  onChange,
  availableStyles,
  availableSpecialties,
}: {
  value: CommunityFilterState;
  onChange: (next: CommunityFilterState) => void;
  availableStyles: string[];
  availableSpecialties: string[];
}) {
  const styles = useMemo(() => uniqSorted(availableStyles).slice(0, 24), [availableStyles]);
  const specialties = useMemo(() => uniqSorted(availableSpecialties).slice(0, 24), [availableSpecialties]);

  return (
    <aside className="space-y-8">
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
        <label htmlFor="community-search" className="text-sm font-semibold text-slate-900">
          Search
        </label>
        <input
          id="community-search"
          value={value.q}
          onChange={(e) => onChange({ ...value, q: e.target.value })}
          placeholder="Search artists, styles, or keywords…"
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
        <h2 className="text-sm font-semibold text-slate-900">Style</h2>
        <div className="mt-3 space-y-2">
          {styles.length === 0 ? <p className="text-xs text-slate-500">No style tags yet.</p> : null}
          {styles.map((t) => (
            <label key={t} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                checked={value.styles.includes(t)}
                onChange={() => onChange({ ...value, styles: toggleInList(value.styles, t) })}
              />
              <span className="truncate">{t}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
        <h2 className="text-sm font-semibold text-slate-900">Specialty</h2>
        <div className="mt-3 space-y-2">
          {specialties.length === 0 ? <p className="text-xs text-slate-500">No specialties yet.</p> : null}
          {specialties.map((t) => (
            <label key={t} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                checked={value.specialties.includes(t)}
                onChange={() => onChange({ ...value, specialties: toggleInList(value.specialties, t) })}
              />
              <span className="truncate">{t}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
        <h2 className="text-sm font-semibold text-slate-900">Experience level</h2>
        <div className="mt-3 space-y-2">
          {(["newcomer", "intermediate", "pro"] as const).map((lvl) => (
            <label key={lvl} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                checked={value.experienceLevels.includes(lvl)}
                onChange={() => onChange({ ...value, experienceLevels: toggleInList(value.experienceLevels, lvl) })}
              />
              <span className="capitalize">{lvl}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
        <h2 className="text-sm font-semibold text-slate-900">Availability</h2>
        <div className="mt-3 space-y-2">
          {(["open", "soon", "closed"] as const).map((a) => (
            <label key={a} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                checked={value.availability.includes(a)}
                onChange={() => onChange({ ...value, availability: toggleInList(value.availability, a) })}
              />
              <span className="capitalize">{a}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
        <label htmlFor="community-location" className="text-sm font-semibold text-slate-900">
          Location
        </label>
        <input
          id="community-location"
          value={value.location}
          onChange={(e) => onChange({ ...value, location: e.target.value })}
          placeholder="Remote, Austin, NY…"
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      </section>

      <button
        type="button"
        onClick={() =>
          onChange({
            q: "",
            sort: "most_active",
            styles: [],
            specialties: [],
            experienceLevels: [],
            availability: [],
            location: "",
          })
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Clear filters
      </button>
    </aside>
  );
}

