import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How ArtNoCap collects, uses, discloses, and safeguards information when you use our website and services.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-slate-50 py-14 sm:py-20">
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm font-medium text-slate-600">
          <strong className="text-slate-800">Effective date:</strong> April 19, 2026
        </p>

        <article className="mt-10 space-y-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-10">
          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <p>
              ArtNoCap (&quot;ArtNoCap,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy and is committed to
              protecting your personal information. This Privacy Policy describes how we collect, use,
              disclose, and safeguard information when you access or use the ArtNoCap website and related
              services (the &quot;Service&quot;).
            </p>
            <p>By using the Service, you consent to the practices described in this Privacy Policy.</p>
          </section>

          <section className="space-y-4 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">1. Information we collect</h2>
            <p>We may collect the following categories of information:</p>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">1.1 Information you provide</h3>
              <p className="mt-2">Information you provide directly when using the Service, including:</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>account registration information (e.g., name, email address)</li>
                <li>authentication data (including via third-party providers such as Google)</li>
                <li>content you submit, including project briefs, artwork, descriptions, and metadata</li>
                <li>communications you send to us</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">1.2 Automatically collected information</h3>
              <p className="mt-2">When you access or use the Service, we may automatically collect:</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>IP address</li>
                <li>browser type and device information</li>
                <li>operating system</li>
                <li>usage data (pages viewed, interactions, timestamps)</li>
                <li>log and diagnostic information</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">1.3 Cookies and similar technologies</h3>
              <p className="mt-2">We may use cookies and similar tracking technologies to:</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>maintain sessions</li>
                <li>improve functionality</li>
                <li>analyze usage</li>
              </ul>
              <p className="mt-3">
                You may control cookies through your browser settings; however, disabling cookies may affect
                the functionality of the Service.
              </p>
            </div>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">2. How we use information</h2>
            <p>We use collected information to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>provide, operate, and maintain the Service</li>
              <li>authenticate users and manage accounts</li>
              <li>display and distribute user-submitted content</li>
              <li>improve, personalize, and optimize the Service</li>
              <li>monitor usage and detect abuse or misuse</li>
              <li>communicate with users, including service-related notifications</li>
              <li>comply with legal obligations</li>
            </ul>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">3. User content and public information</h2>
            <p>
              Content you submit to the Service (including projects, artwork, and related information) may
              be publicly visible.
            </p>
            <p>You acknowledge that:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>any content you choose to make public may be viewed, accessed, or shared by others</li>
              <li>we cannot control how other users use or interpret such content</li>
            </ul>
          </section>

          <section className="space-y-4 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">4. How we share information</h2>
            <p>We do not sell your personal information.</p>
            <p>We may share information in the following circumstances:</p>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">4.1 Service providers</h3>
              <p className="mt-2">
                We may share information with third-party service providers who assist in operating the
                Service, including:
              </p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>hosting providers (e.g., Vercel)</li>
                <li>database and backend services (e.g., Supabase)</li>
                <li>analytics providers</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">4.2 Legal requirements</h3>
              <p className="mt-2">We may disclose information if required to:</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>comply with applicable law, regulation, or legal process</li>
                <li>respond to lawful requests by public authorities</li>
                <li>protect the rights, safety, or property of ArtNoCap or others</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">4.3 Business transfers</h3>
              <p className="mt-2">
                In the event of a merger, acquisition, restructuring, or sale of assets, user information may
                be transferred as part of that transaction.
              </p>
            </div>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">5. Data storage and security</h2>
            <p>
              We implement reasonable technical and organizational measures designed to protect your
              information.
            </p>
            <p>
              However, no method of transmission or storage is completely secure, and we cannot guarantee
              absolute security.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">6. Data retention</h2>
            <p>We retain information for as long as necessary to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>provide the Service</li>
              <li>comply with legal obligations</li>
              <li>resolve disputes</li>
              <li>enforce our agreements</li>
            </ul>
            <p>We may retain certain data after account deletion where required or permitted by law.</p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">7. Your rights and choices</h2>
            <p>
              Depending on your jurisdiction, you may have rights regarding your personal information,
              including:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>the right to access, update, or correct your information</li>
              <li>the right to request deletion of your information</li>
              <li>the right to restrict or object to certain processing</li>
            </ul>
            <p>
              You may exercise these rights by contacting us using the contact method we publish on this
              website (for example, a dedicated privacy inbox or contact form when available).
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">8. Third-party services and links</h2>
            <p>The Service may contain links to third-party websites or services.</p>
            <p>
              We are not responsible for the privacy practices of such third parties. You should review their
              policies before providing information.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">9. Children&apos;s privacy</h2>
            <p>
              The Service is not directed to children under the age of 13 (or the minimum age required by
              applicable law).
            </p>
            <p>
              We do not knowingly collect personal information from children. If we become aware of such
              collection, we will take steps to delete the information.
            </p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">10. International data transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own,
              including the United States.
            </p>
            <p>By using the Service, you consent to such transfers, subject to applicable law.</p>
          </section>

          <section className="space-y-3 text-sm leading-relaxed text-slate-700">
            <h2 className="text-base font-semibold text-slate-900">11. Changes to this privacy policy</h2>
            <p>We may update this Privacy Policy from time to time.</p>
            <p>
              We will post the updated version with a revised effective date. Continued use of the Service
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <p className="border-t border-slate-200 pt-6 text-xs text-slate-500">
            See also our{" "}
            <Link href="/legal/terms-of-use" className="font-semibold text-indigo-700 hover:text-indigo-800">
              Terms of Use
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
