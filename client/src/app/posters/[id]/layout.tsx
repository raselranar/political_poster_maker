import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Poster Preview",
  description: "View, download, or regenerate your poster.",
};

export default function PosterLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
