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
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={buttonSurfaceClasses({
        variant: selected ? "primary" : "secondary",
        size: "default",
      })}
    >
      <ThumbsUp className={`h-4 w-4 ${selected ? "fill-white" : ""}`} aria-hidden />
      {selected ? "Voted" : "Vote"}
    </button>
  );
}

