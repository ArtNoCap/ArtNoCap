const KEY = "artnocap:submitter-key-v1";

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getOrCreateSubmitterKey(): string {
  if (typeof window === "undefined") return randomId();
  const existing = window.localStorage.getItem(KEY);
  if (existing && existing.trim().length > 0) return existing;
  const next = randomId();
  window.localStorage.setItem(KEY, next);
  return next;
}
