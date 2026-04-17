"use client";

export type SubmissionSortId = "top" | "new";

const OPTIONS: { id: SubmissionSortId; label: string }[] = [
  { id: "top", label: "Top voted" },
  { id: "new", label: "Newest" },
];

export function SortDropdown({
  value,
  onChange,
}: {
  value: SubmissionSortId;
  onChange: (next: SubmissionSortId) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="submission-sort" className="text-sm font-semibold text-slate-700">
        Sort by:
      </label>
      <select
        id="submission-sort"
        value={value}
        onChange={(e) => onChange(e.target.value as SubmissionSortId)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
      >
        {OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

