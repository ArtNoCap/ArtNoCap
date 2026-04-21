/** HttpOnly cookie storing a stable UUID for guest voters (no login). */
export const GUEST_VOTER_COOKIE = "anc_guest_voter";

export function guestVoterCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
    secure: process.env.NODE_ENV === "production",
  };
}
