"use client";

import { ThumbsUp } from "lucide-react";

export function VoteButton({
  selected,
  onClick,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:pointer-events-none disabled:opacity-50 ${
        selected
          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 ring-1 ring-indigo-600"
          : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      <ThumbsUp className={`h-4 w-4 ${selected ? "fill-white" : ""}`} aria-hidden />
      {selected ? "Voted" : "Vote"}
    </button>
  );
}

