import { Container } from "@/components/ui/Container";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="bg-white py-16">
      <Container>
        <h1 className="text-3xl font-bold text-slate-900">About ArtNoCap</h1>
        <div className="mt-10 max-w-2xl space-y-6 text-base leading-relaxed text-slate-600">
          <h2 className="text-xl font-semibold text-slate-900">The idea</h2>
          <p>
            Creative work is often subjective. What one person envisions isn’t always what they
            receive.
          </p>
          <p>
            ArtNoCap is built around a simple premise: the best way to find the right design is to see
            more than one option.
          </p>
          <p>
            By opening a project to multiple contributors, users can compare approaches, discover
            unexpected ideas, and make more informed choices.
          </p>
          <p>
            At the same time, taste is personal. What resonates with one person may not resonate with
            another.
          </p>
          <p>
            ArtNoCap treats community feedback as a signal—not a decision. Voting helps surface designs
            that others find compelling, but it does not determine the outcome. The final choice always
            belongs to the project creator.
          </p>
          <p>
            In that sense, the platform balances individual preference with shared perspective—allowing
            users to benefit from the opinions of others without being defined by them.
          </p>
        </div>
      </Container>
    </div>
  );
}
