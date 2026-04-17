const SESSION_KEY = "designhub:mock-session-v1";

/** One-shot flag after mock login/signup so Start Project can show a resume hint. */
export const AUTH_RETURN_FLASH_KEY = "designhub:auth-return-flash";

export type MockSession = {
  displayName: string;
  createdAt: string;
};

function readSession(): MockSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as MockSession;
    if (!data || typeof data.displayName !== "string" || data.displayName.trim().length === 0) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function getMockSession(): MockSession | null {
  return readSession();
}

export function isMockLoggedIn(): boolean {
  return readSession() !== null;
}

export function setMockSession(displayName: string): void {
  const session: MockSession = {
    displayName: displayName.trim(),
    createdAt: new Date().toISOString(),
  };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearMockSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
}
