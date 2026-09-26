import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Create a Poster",
  description: "Create a campaign, victory, or tribute poster from a template.",
};

export default function CreateLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
