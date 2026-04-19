import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New password",
  description: "Set a new password for your ArtNoCap account.",
};

export default function UpdatePasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
