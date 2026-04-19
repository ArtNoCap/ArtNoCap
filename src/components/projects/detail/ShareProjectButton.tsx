"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

type ShareStatus = "idle" | "copied" | "error";

function isAbortError(e: unknown): boolean {
  return (
    e instanceof DOMException && e.name === "AbortError"
  ) || (e instanceof Error && e.name === "AbortError");
}

export function ShareProjectButton({
  slug,
  title,
  text,
  className,
}: {
  slug: string;
  title: string;
  /** Optional line for the system share sheet (trimmed). */
  text?: string;
  className?: string;
}) {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const resetSoon = useCallback((next: ShareStatus, ms: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus(next);
    timeoutRef.current = setTimeout(() => setStatus("idle"), ms);
  }, []);

  const buildUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    return new URL(`/projects/${slug}`, window.location.origin).href;
  }, [slug]);

  const onShare = useCallback(async () => {
    const url = buildUrl();
    if (!url) return;

    const line = (text ?? title).trim().slice(0, 400);
    const sharePayload: ShareData = { title, text: line || title, url };

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        const can =
          typeof navigator.canShare === "function" ? navigator.canShare(sharePayload) : true;
        if (can) {
          await navigator.share(sharePayload);
          return;
        }
      } catch (e) {
        if (isAbortError(e)) return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      resetSoon("copied", 2500);
    } catch {
      resetSoon("error", 3500);
    }
  }, [buildUrl, title, text, resetSoon]);

  const liveMessage =
    status === "copied"
      ? "Project link copied to clipboard."
      : status === "error"
        ? "Could not copy link. Try selecting the address bar or use a secure (HTTPS) connection."
        : "";

  return (
    <>
      <span className="sr-only" aria-live="polite">
        {liveMessage}
      </span>
      <Button
        type="button"
        variant="secondary"
        className={className}
        onClick={() => void onShare()}
        aria-label={`Share project: ${title}`}
      >
        {status === "copied" ? (
          <>
            <Check className="h-4 w-4 shrink-0" aria-hidden />
            Link copied
          </>
        ) : status === "error" ? (
          <>
            <Link2 className="h-4 w-4 shrink-0" aria-hidden />
            Copy failed — try again
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4 shrink-0" aria-hidden />
            Share
          </>
        )}
      </Button>
    </>
  );
}
