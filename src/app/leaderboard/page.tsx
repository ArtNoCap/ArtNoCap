import { Container } from "@/components/ui/Container";

export const metadata = {
  title: "Leaderboard",
};

export default function LeaderboardPlaceholderPage() {
  return (
    <div className="bg-slate-50 py-16">
      <Container>
        <h1 className="text-3xl font-bold text-slate-900">Leaderboard</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Phase 4 will add Top Creators / Top Voters tabs, time filters, podium cards, and ranking
          tables backed by mock data.
        </p>
      </Container>
    </div>
  );
}
