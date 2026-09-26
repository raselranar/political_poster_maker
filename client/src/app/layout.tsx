import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Political Poster Maker",
    template: "%s | Political Poster Maker",
  },
  applicationName: "Political Poster Maker",
  description:
    "Create, customize, and manage campaign posters with the Political Poster Maker.",
  openGraph: {
    title: "Political Poster Maker",
    description:
      "Create, customize, and manage campaign posters with the Political Poster Maker.",
    siteName: "Political Poster Maker",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Political Poster Maker",
    description:
      "Create, customize, and manage campaign posters with the Political Poster Maker.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}>
      <body className="min-h-full flex flex-col bg-background">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
