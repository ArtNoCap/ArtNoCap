import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/ContactForm";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a message to the ArtNoCap team. Your address is used for replies only.",
};

export default function ContactPage() {
  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <Container className="max-w-lg">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Contact</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Write us</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          We don&apos;t publish a public email address. Use this form—we&apos;ll get a notification and can
          reply to the address you provide.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <ContactForm />
        </div>

        <p className="mt-8 text-center text-sm text-slate-600">
          <Link
            href="/"
            className="font-semibold text-indigo-700 hover:text-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Back to home
          </Link>
        </p>
      </Container>
    </div>
  );
}
