# ArtNoCap × Supabase email templates

Supabase sends auth emails from **your project**, not from this repo. To use the branded HTML below:

1. Open the [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **Email Templates**.
2. For each template, paste the **Subject** (see below) and the **entire HTML file** as the template body. Supabase supports Go template variables such as `{{ .ConfirmationURL }}` and `{{ .Email }}`.

**Suggested subjects**

- `confirm-signup.html` → **Confirm your ArtNoCap account**
- `reset-password.html` → **Reset your ArtNoCap password**
3. Under **Authentication** → **URL Configuration**, ensure **Site URL** is your production origin (e.g. `https://artnocap.com`) and **Redirect URLs** includes:
   - `https://YOUR_DOMAIN/auth/callback`
   - Local dev: `http://localhost:3000/auth/callback` (adjust port if needed)

The app calls `resetPasswordForEmail` and `signUp` with `redirectTo` pointing at `/auth/callback?...`. If emails link to the wrong host, links will fail until Site URL / redirect allow list match.

**Templates in this folder**

| File | Supabase UI name |
|------|------------------|
| `confirm-signup.html` | Confirm sign up |
| `reset-password.html` | Reset password |

Optional: duplicate tone for **Magic link** or **Change email address** using the same layout and swapping the CTA copy.
