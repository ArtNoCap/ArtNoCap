import Link from "next/link";
import { Pencil } from "lucide-react";
import { Container } from "@/components/ui/Container";

const columns = [
  {
    title: "Platform",
    links: [
      { href: "/browse", label: "Browse Projects" },
      { href: "/#how-it-works", label: "How It Works" },
      { href: "/projects/new", label: "Start a Project" },
      { href: "/browse", label: "Open Projects" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/community", label: "Artists & bios (soon)" },
      { href: "/browse", label: "Gallery" },
      { href: "/artists/alex-rivera", label: "Top Creators" },
      { href: "/blog", label: "Journal" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/legal/terms-of-use", label: "Terms of Use" },
      { href: "/legal/privacy-policy", label: "Privacy Policy" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <Container className="py-12">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold text-slate-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Pencil className="h-4 w-4" aria-hidden />
              </span>
              ArtNoCap
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
              Community-powered artwork requests. Post a brief, collect submissions, and vote on
              favorites—no checkout, just creativity.
            </p>
            <p className="mt-6 text-xs text-slate-500">
              © {new Date().getFullYear()} ArtNoCap. The ArtNoCap name, logo, and site are proprietary.
              Submitted artwork and briefs are provided by users and remain subject to creator grants,
              project rules, and our legal disclaimers. All rights not expressly granted are reserved.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-8">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-sm font-semibold text-slate-900">{col.title}</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
