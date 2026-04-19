import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms governing access to and use of the ArtNoCap website and related services.",
};

export default function TermsOfUsePage() {
  return (
    <div className="bg-slate-50 py-14 sm:py-20">
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Terms of Use</h1>
        <p className="mt-3 text-sm font-medium text-slate-600">
          <strong className="text-slate-800">Effective date:</strong> April 19, 2026
        </p>

        <article className="mt-10 space-y-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-10">
          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <p>
              These Terms of Use (&quot;Terms&quot;) govern your access to and use of the ArtNoCap website
              and related services (collectively, the &quot;Service&quot;) operated by ArtNoCap
              (&quot;ArtNoCap,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
            </p>
            <p>
              By accessing or using the Service, you agree to be bound by these Terms. If you do not
              agree, you must not access or use the Service.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">1. Eligibility</h2>
            <p>
              You represent and warrant that you are at least thirteen (13) years of age, or the
              minimum age required to use the Service under applicable law in your jurisdiction, and
              that you have the legal capacity to enter into these Terms.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">2. Account registration and security</h2>
            <p>
              Certain features of the Service may require registration of an account. You agree to
              provide accurate and complete information and to maintain and promptly update such
              information as necessary.
            </p>
            <p>You are solely responsible for:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>maintaining the confidentiality of your account credentials; and</li>
              <li>all activities that occur under your account.</li>
            </ul>
            <p>You agree to notify us immediately of any unauthorized use of your account.</p>
            <p>
              We reserve the right, in our sole discretion, to suspend or terminate any account at
              any time, with or without notice.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">3. Description of service</h2>
            <p>ArtNoCap provides a platform that enables users to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>create project briefs;</li>
              <li>submit artwork and other content; and</li>
              <li>view, evaluate, and interact with user-generated content.</li>
            </ul>
            <p>
              The Service is provided for informational and community purposes only. ArtNoCap does not
              act as an agent, broker, or intermediary for transactions between users.
            </p>
          </section>

          <section className="space-y-4 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">4. User content</h2>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">4.1 Ownership</h3>
              <p className="mt-2">
                You retain all right, title, and interest in and to any content you submit, upload, or
                otherwise make available through the Service (&quot;User Content&quot;).
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">4.2 License grant</h3>
              <p className="mt-2">
                By submitting User Content, you grant to ArtNoCap a worldwide, non-exclusive,
                perpetual, irrevocable, royalty-free, transferable, and sublicensable license to use,
                reproduce, display, perform, distribute, adapt, and otherwise exploit such User Content
                in connection with the operation, promotion, and improvement of the Service.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">4.3 Representations and warranties</h3>
              <p className="mt-2">You represent and warrant that:</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  you own or have all necessary rights, licenses, and permissions to submit the User
                  Content;
                </li>
                <li>
                  your User Content does not infringe or violate any third-party rights, including
                  intellectual property, privacy, or publicity rights; and
                </li>
                <li>your User Content complies with all applicable laws and regulations.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">5. Project content and creative direction</h2>
            <p>
              Users may submit project briefs, reference materials, and creative direction indicators.
              Such materials are provided for informational purposes only and do not constitute binding
              specifications, contractual terms, or guarantees of any outcome.
            </p>
            <p>
              ArtNoCap does not verify, validate, or guarantee the accuracy, completeness, or suitability
              of such materials.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">6. Community interaction and voting</h2>
            <p>The Service may include features such as voting, favoriting, or other forms of community interaction.</p>
            <p>You acknowledge and agree that:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>such interactions are subjective and informational in nature;</li>
              <li>they do not constitute endorsements, recommendations, or guarantees; and</li>
              <li>they do not determine or obligate any outcome.</li>
            </ul>
            <p>
              All decisions regarding the selection or use of User Content remain solely with the
              applicable user.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">7. No marketplace or financial transactions</h2>
            <p>
              ArtNoCap is not a marketplace and does not process payments, facilitate transactions, or
              enforce agreements between users.
            </p>
            <p>
              Any arrangements, agreements, or transactions between users occur independently of the
              Service and are solely the responsibility of the parties involved.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">8. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                upload or transmit any content that is unlawful, infringing, defamatory, obscene, or
                otherwise objectionable;
              </li>
              <li>impersonate any person or entity;</li>
              <li>interfere with or disrupt the operation of the Service;</li>
              <li>introduce malicious code or engage in unauthorized access;</li>
              <li>use automated means to scrape or extract data from the Service; or</li>
              <li>engage in any activity that violates applicable laws or regulations.</li>
            </ul>
            <p>We reserve the right to remove content or restrict access in our sole discretion.</p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">9. Intellectual property and third-party rights</h2>
            <p>
              ArtNoCap does not guarantee that content available on the Service is original,
              non-infringing, or suitable for any purpose.
            </p>
            <p>Users access and use such content at their own risk.</p>
            <p>
              ArtNoCap may, but is not obligated to, respond to notices of alleged infringement in
              accordance with applicable law.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">10. Disclaimer of warranties</h2>
            <p className="font-medium uppercase tracking-wide text-slate-800">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE,&quot; WITHOUT WARRANTIES OF ANY KIND,
              WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR TITLE.
            </p>
            <p className="font-medium uppercase tracking-wide text-slate-800">
              ARTNOCAP DOES NOT WARRANT THAT: THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE; CONTENT
              WILL BE ACCURATE OR RELIABLE; OR THE SERVICE OR CONTENT WILL BE FREE FROM VIRUSES OR OTHER
              HARMFUL COMPONENTS.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">11. Limitation of liability</h2>
            <p className="font-medium uppercase tracking-wide text-slate-800">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, ARTNOCAP AND ITS AFFILIATES, OFFICERS, DIRECTORS,
              EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA,
              GOODWILL, OR BUSINESS OPPORTUNITIES, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">12. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless ArtNoCap and its affiliates, officers,
              directors, employees, and agents from and against any claims, liabilities, damages,
              losses, and expenses, including reasonable attorneys&apos; fees, arising out of or related to:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>your use of the Service;</li>
              <li>your User Content; or</li>
              <li>your violation of these Terms.</li>
            </ul>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">13. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to the Service at any time, with
              or without cause or notice.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">14. Modifications to the service</h2>
            <p>
              We may modify, suspend, or discontinue any aspect of the Service at any time without
              liability.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">15. Modifications to these terms</h2>
            <p>
              We may update these Terms at any time. Continued use of the Service after such changes
              constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">16. Governing law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United
              States and the State of Delaware, without regard to its conflict of laws principles.
            </p>
            <p className="text-xs text-slate-500">
              If you operate ArtNoCap through a different entity or need another governing law, replace
              this section after review with counsel.
            </p>
          </section>

          <p className="border-t border-slate-200 pt-6 text-xs text-slate-500">
            See also the{" "}
            <Link href="/legal/privacy-policy" className="font-semibold text-indigo-700 hover:text-indigo-800">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/legal/user-content-disclaimer"
              className="font-semibold text-indigo-700 hover:text-indigo-800"
            >
              user content disclaimer
            </Link>
            .
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
