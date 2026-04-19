import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check your email",
  description: "Confirm your email address to finish creating your ArtNoCap profile.",
};

export default function SignupCheckEmailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
