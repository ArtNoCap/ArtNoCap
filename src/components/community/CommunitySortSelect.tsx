"use client";

import type { CommunitySortId } from "@/components/community/types";

export function CommunitySortSelect({
  value,
  onChange,
}: {
  value: CommunitySortId;
  onChange: (next: CommunitySortId) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      <span className="font-semibold text-slate-900">Sort by</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as CommunitySortId)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
      >
        <option value="most_active">Most active</option>
        <option value="newest">Newest</option>
      </select>
    </label>
  );
}

