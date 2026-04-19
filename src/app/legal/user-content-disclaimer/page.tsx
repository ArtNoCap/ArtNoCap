import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "User content & liability (draft)",
  description:
    "Draft community disclaimer: use of ArtNoCap, uploads, voting, and content is at your own risk.",
};

export default function UserContentDisclaimerPage() {
  return (
    <div className="bg-slate-50 py-14 sm:py-20">
      <Container className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">
          Draft — not legal advice
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          User content, community activity & liability
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          This page is a <strong className="text-slate-800">working draft</strong> for ArtNoCap. It
          is not a substitute for advice from a qualified attorney. We may replace or revise this
          text before launch.
        </p>

        <article className="mt-10 space-y-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-10">
          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">1. Who this applies to</h2>
            <p>
              “ArtNoCap,” “we,” “us,” and “our” refer to the ArtNoCap website, its operators, owners,
              affiliates, volunteers, and anyone acting on our behalf. “You” means anyone who
              accesses the site, views content, creates an account, uploads files, votes, browses,
              or otherwise uses the service.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">2. No moderation guarantee</h2>
            <p>
              ArtNoCap <strong className="text-slate-900">does not guarantee</strong> review,
              screening, or removal of user-submitted projects, artwork, text, links, or other
              materials. We may <strong className="text-slate-900">not</strong> employ moderators or
              editorial staff. Content may appear that is inaccurate, offensive, infringing, or
              otherwise objectionable. You encounter it <strong className="text-slate-900">at your
              own discretion and risk</strong>.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">3. Your responsibility for what you upload</h2>
            <p>
              Project <strong className="text-slate-900">content level</strong> labels (for example
              Standard, Expressive, or Unrestricted) are a{" "}
              <strong className="text-slate-900">self-reported signal</strong> to help creators choose
              briefs. They are <strong className="text-slate-900">not</strong> a legal classification,
              age rating, or guarantee of what you will see on the site.
            </p>
            <p>
              You are solely responsible for any content you submit (including images, descriptions,
              metadata, and links). You represent that you have the rights needed to post that
              content—including copyright, trademark, publicity, and privacy rights—and that your
              uploads do not violate applicable law or anyone else’s rights.
            </p>
            <p>
              We do <strong className="text-slate-900">not</strong> warrant that your use of the
              platform will be lawful in your jurisdiction or that others’ uploads will respect your
              rights.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">4. Copyright & third-party claims</h2>
            <p>
              If a user uploads material that infringes a copyright, trademark, or other right, or
              that violates community norms or guidelines (including any guidelines we may publish
              later), <strong className="text-slate-900">you agree that ArtNoCap and its owners are
              not responsible</strong> for that conduct or content, and you will not hold us liable
              for claims, losses, damages, or expenses (including reasonable legal fees) arising from
              disputes between users or between a user and a third party, except where the law does
              not allow such a limitation.
            </p>
            <p>
              Takedown or enforcement procedures (for example, under the DMCA or similar laws) may
              be described in a separate policy when available; until then, contact information for
              rights holders may be published on this site when we are ready to receive it.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">5. Viewing, voting, downloading, sharing</h2>
            <p>
              You use ArtNoCap—including viewing galleries, voting, favoriting, downloading or
              saving images, following links, or sharing content elsewhere—<strong className="text-slate-900">at
              your own risk</strong>. We do not warrant that content is safe, accurate, licensed for
              your intended use, or free of malware. You should apply the same caution you would on
              any open community site.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">6. “Full usage rights” on the home page</h2>
            <p>
              Marketing copy on the home page (for example, “Full usage rights”) is a{" "}
              <strong className="text-slate-900">high-level description of intent</strong>, not a
              contract granting you any specific license. Actual license terms between project
              owners, submitters, and voters—if any—may be set in project briefs, separate agreements,
              or future terms of service. If there is a conflict between informal copy and a signed
              or published legal document, the document controls.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">7. Limitation of liability (draft)</h2>
            <p>
              To the maximum extent permitted by law, ArtNoCap and its owners, directors, employees,
              contractors, and affiliates disclaim liability for indirect, incidental, special,
              consequential, or punitive damages, and for loss of profits, data, goodwill, or
              business opportunities, arising from or related to your use of the site or reliance on
              any content—whether based on warranty, contract, tort (including negligence), or any
              other theory—even if we have been advised of the possibility of such damages.
            </p>
            <p>
              Some jurisdictions do not allow certain limitations; in those cases, our liability is
              limited to the fullest extent still permitted.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">8. Changes</h2>
            <p>
              We may update this draft at any time. Continued use of the site after changes are posted
              constitutes your acceptance of the revised draft, to the extent allowed by law.
            </p>
          </section>

          <p className="border-t border-slate-200 pt-6 text-xs text-slate-500">
            Last updated: draft for internal and community review. For questions, use the contact
            method listed on the site when available.
          </p>
        </article>

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
