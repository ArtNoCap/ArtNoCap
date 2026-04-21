"use client";

import { ThumbsUp } from "lucide-react";
import { buttonSurfaceClasses } from "@/components/ui/Button";

export function VoteButton({
  selected,
  onClick,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const glow =
    "cursor-pointer transition-shadow hover:shadow-[0_0_0_3px_rgba(99,102,241,0.18),0_12px_30px_-16px_rgba(99,102,241,0.55)] focus-visible:shadow-[0_0_0_4px_rgba(99,102,241,0.22),0_14px_34px_-18px_rgba(99,102,241,0.6)]";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={buttonSurfaceClasses({
        variant: selected ? "primary" : "secondary",
        size: "default",
        className: glow,
      })}
    >
      <ThumbsUp className={`h-4 w-4 ${selected ? "fill-white" : ""}`} aria-hidden />
      {selected ? "Voted" : "Vote"}
    </button>
  );
}

