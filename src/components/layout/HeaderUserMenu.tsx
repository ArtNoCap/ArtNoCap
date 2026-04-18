"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function HeaderUserMenu({
  email,
  displayName,
  avatarUrl,
}: {
  email: string | null | undefined;
  displayName: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const fallbackAvatar = useMemo(() => {
    const seed = encodeURIComponent(displayName || email || "user");
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  }, [displayName, email]);

  async function onSignOut() {
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.refresh();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 text-left shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="relative h-8 w-8 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/80">
          <Image
            src={avatarUrl || fallbackAvatar}
            alt=""
            fill
            sizes="32px"
            unoptimized={!avatarUrl}
            className="object-cover"
          />
        </span>
        <span className="min-w-0 max-w-[11rem]">
          <span className="block truncate text-left text-xs font-semibold text-slate-900">{displayName}</span>
          {email ? (
            <span className="block truncate text-left text-[11px] text-slate-500">{email}</span>
          ) : null}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg ring-1 ring-slate-200/80"
        >
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
            {email ? <p className="truncate text-xs text-slate-500">{email}</p> : null}
          </div>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => {
              setOpen(false);
              router.push("/browse");
            }}
          >
            <UserRound className="h-4 w-4" aria-hidden />
            Profile (soon)
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={busy}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
            onClick={() => void onSignOut()}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            {busy ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
