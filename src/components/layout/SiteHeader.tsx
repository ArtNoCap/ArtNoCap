"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { User } from "@supabase/supabase-js";
import { HeaderUserMenu } from "@/components/layout/HeaderUserMenu";

const nav = [
  { href: "/browse", label: "Browse Projects" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/browse", label: "Community" },
  { href: "/about", label: "About" },
];

export function SiteHeader({
  user,
}: {
  user: { email: User["email"]; displayName: string; avatarUrl: string | null } | null;
}) {
  const pathname = usePathname() || "/";
  const returnTo = encodeURIComponent(pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <Pencil className="h-4 w-4" aria-hidden />
          </span>
          <span>ArtNoCap</span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex"
        >
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <HeaderUserMenu email={user.email} displayName={user.displayName} avatarUrl={user.avatarUrl} />
          ) : (
            <>
              <Button
                href={`/login?returnTo=${returnTo}`}
                variant="ghost"
                className="hidden sm:inline-flex px-3"
              >
                Log in
              </Button>
              <Button href={`/signup?returnTo=${returnTo}`} variant="primary" className="px-4 py-2 text-sm">
                Sign up
              </Button>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
