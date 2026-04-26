"use client";

import { useEffect, useId, useMemo, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

type Props = {
  siteKey: string;
  onToken: (token: string | null) => void;
};

export function TurnstileWidget({ siteKey, onToken }: Props) {
  const containerId = useId();
  const [loaded, setLoaded] = useState(false);

  const scriptSrc = useMemo(() => "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit", []);

  useEffect(() => {
    onToken(null);
    if (!siteKey) return;

    let cancelled = false;
    const existing = document.querySelector(`script[src="${scriptSrc}"]`) as HTMLScriptElement | null;

    const ensureScript = async () => {
      if (existing) {
        if ((window as any).turnstile) return;
        await new Promise<void>((resolve) => {
          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener("error", () => resolve(), { once: true });
        });
        return;
      }

      await new Promise<void>((resolve) => {
        const s = document.createElement("script");
        s.src = scriptSrc;
        s.async = true;
        s.defer = true;
        s.addEventListener("load", () => resolve(), { once: true });
        s.addEventListener("error", () => resolve(), { once: true });
        document.head.appendChild(s);
      });
    };

    let widgetId: string | null = null;

    (async () => {
      await ensureScript();
      if (cancelled) return;
      const t = window.turnstile;
      if (!t) return;

      const el = document.getElementById(containerId);
      if (!el) return;

      widgetId = t.render(el, {
        sitekey: siteKey,
        theme: "light",
        callback: (token: unknown) => {
          if (typeof token === "string") onToken(token);
        },
        "expired-callback": () => onToken(null),
        "error-callback": () => onToken(null),
      });
      setLoaded(true);
    })();

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile?.remove) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          // ignore
        }
      }
    };
  }, [containerId, onToken, scriptSrc, siteKey]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-200/50">
      <div id={containerId} />
      {!loaded ? <p className="mt-2 text-xs text-slate-500">Loading captcha…</p> : null}
    </div>
  );
}

