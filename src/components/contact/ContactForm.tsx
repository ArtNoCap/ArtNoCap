"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30";

export function ContactForm() {
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setBusy(true);
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            message: message.trim(),
            website: honeypotRef.current?.value?.trim() ?? "",
          }),
        });
        const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
        if (!res.ok || !json?.ok) {
          setError(json?.error || `Something went wrong (${res.status}).`);
          return;
        }
        setSent(true);
        setMessage("");
      } finally {
        setBusy(false);
      }
    },
    [email, message, name],
  );

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-sm text-emerald-950 shadow-sm ring-1 ring-emerald-100">
        <p className="font-semibold">Message sent.</p>
        <p className="mt-2 leading-relaxed">
          Thanks for reaching out. If you included a valid return address, you can use the same thread
          from your inbox when we reply.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(ev) => void onSubmit(ev)} className="relative space-y-5">
      <div className="absolute left-[10000px] top-0 h-px w-px overflow-hidden opacity-0" aria-hidden>
        <label htmlFor="contact-company">Company</label>
        <input
          ref={honeypotRef}
          id="contact-company"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-900">
          Name <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${inputClass} mt-2`}
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-900">
          Your email <span className="text-red-600">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${inputClass} mt-2`}
          aria-invalid={Boolean(error)}
        />
        <p className="mt-1.5 text-xs text-slate-500">Used only so we can reply—not shown on the public site.</p>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-900">
          Message <span className="text-red-600">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          minLength={10}
          maxLength={10000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputClass} mt-2 resize-y`}
        />
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" variant="primary" size="lg" className="w-full justify-center sm:w-auto" disabled={busy}>
        {busy ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
