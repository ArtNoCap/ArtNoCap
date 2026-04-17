import { Container } from "@/components/ui/Container";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="bg-white py-16">
      <Container>
        <h1 className="text-3xl font-bold text-slate-900">About ArtNoCap</h1>
        <div className="mt-6 max-w-2xl space-y-4 text-base leading-relaxed text-slate-600">
          <p>
            ArtNoCap is a community-driven artwork request platform. Creators post briefs as{" "}
            <strong className="text-slate-900">projects</strong>, the community submits finished
            images, and voters help favorites rise to the top.
          </p>
          <p>
            <span className="font-semibold text-slate-900">[Placeholder]</span> Payments,
            ecommerce, and file storage are intentionally out of scope for the MVP front end. Legal
            terms, privacy policy, and licensing language will be finalized before launch.
          </p>
        </div>
      </Container>
    </div>
  );
}
