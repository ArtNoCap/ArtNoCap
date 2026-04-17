"use client";

export type ProjectTabId = "submissions" | "details" | "brief" | "activity";

const TABS: { id: ProjectTabId; label: string }[] = [
  { id: "submissions", label: "Submissions" },
  { id: "details", label: "Details" },
  { id: "brief", label: "Brief" },
  { id: "activity", label: "Activity" },
];

export function ProjectTabs({
  value,
  onChange,
}: {
  value: ProjectTabId;
  onChange: (next: ProjectTabId) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200/80">
      <div className="flex gap-1" role="tablist" aria-label="Project sections">
        {TABS.map((t) => {
          const active = value === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(t.id)}
              className={`relative -mb-px px-3 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                active ? "text-indigo-700" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.label}
              {active ? (
                <span
                  className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-indigo-600"
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

