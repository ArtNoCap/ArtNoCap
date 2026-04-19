"use client";

import ReactMarkdown from "react-markdown";

const mdComponents = {
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mt-12 scroll-mt-24 border-b border-slate-100 pb-2 text-xl font-bold tracking-tight text-slate-900 first:mt-0 sm:text-2xl">
      {children}
    </h2>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-base leading-relaxed text-slate-700 sm:text-lg sm:leading-relaxed">{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-slate-900">{children}</strong>
  ),
  hr: () => <hr className="my-10 border-0 border-t border-slate-200" />,
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="my-4 list-disc space-y-2 pl-5 text-slate-700">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="my-4 list-decimal space-y-2 pl-5 text-slate-700">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      className="font-semibold text-indigo-700 underline decoration-indigo-200 underline-offset-2 hover:text-indigo-900"
    >
      {children}
    </a>
  ),
};

export function BlogMarkdown({ markdown }: { markdown: string }) {
  return (
    <div className="blog-markdown space-y-5">
      <ReactMarkdown components={mdComponents}>{markdown}</ReactMarkdown>
    </div>
  );
}
