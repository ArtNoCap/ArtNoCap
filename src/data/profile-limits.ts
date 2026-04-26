/**
 * Limits for `profiles.style_keywords` and `profiles.specialties` (Postgres `text[]`).
 * Enforced on PATCH `/api/profile` and when mapping DB rows (`mapProfileFromDb`).
 */
export const PROFILE_MAX_STYLE_KEYWORDS = 6;
export const PROFILE_MAX_SPECIALTIES = 24;
export const PROFILE_TAG_MAX_CHARS = 48;
