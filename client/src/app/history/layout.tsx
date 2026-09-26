import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Poster History",
  description: "View and revisit your generated posters.",
};

export default function HistoryLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
