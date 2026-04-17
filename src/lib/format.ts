const dayMs = 86_400_000;

export function daysLeft(endsAt: string, now = new Date()): number {
  const end = new Date(endsAt).getTime();
  const diff = end - now.getTime();
  return Math.max(0, Math.ceil(diff / dayMs));
}

export function formatDaysLeft(endsAt: string): string {
  const d = daysLeft(endsAt);
  if (d === 0) return "Ends today";
  if (d === 1) return "1 day left";
  return `${d} days left`;
}
