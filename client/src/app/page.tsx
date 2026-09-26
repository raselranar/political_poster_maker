import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download, ImagePlus, LayoutTemplate } from "lucide-react";

import TemplateCard from "@/components/templates/TemplateCard";
import { buttonVariants } from "@/components/ui/button";
import { getTemplates } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Template } from "@/types/template";

export const metadata = {
  title: "Home",
  description:
    "Create a campaign poster with a template that fits your message.",
};

export default async function Home() {
  let templates: Template[] = [];

  try {
    const data = await getTemplates();
    templates = data.templates ?? [];
  } catch (error) {
    console.error("Failed to load templates:", error);
  }

  const featuredTemplate = templates[0];

  return (
    <main className="flex-1">
      <header className="border-b bg-background">
        <nav
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8"
          aria-label="Main navigation">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              P
            </span>
            <span>Poster Maker</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/templates"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline">
              Templates
            </Link>
            <Link
              href="/history"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline">
              My posters
            </Link>
            <Link href="/templates" className={buttonVariants({ size: "lg" })}>
              Create poster
              <ArrowRight data-icon="inline-end" />
            </Link>
          </div>
        </nav>
      </header>

      <section className="bg-zinc-950 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="max-w-2xl">
            <p className="mb-5 text-sm font-medium uppercase text-amber-300">
              Your message, made visible
            </p>
            <h1 className="max-w-xl text-4xl font-bold leading-tight sm:text-5xl">
              Make a poster that speaks for you.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-zinc-300 sm:text-lg">
              Choose a design, add your details and photos, and create a
              campaign poster ready to share.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/templates"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-amber-300 text-zinc-950 hover:bg-amber-200",
                )}>
                Create a poster
                <ArrowRight data-icon="inline-end" />
              </Link>
              <Link
                href="/templates"
                className="text-sm font-medium text-zinc-200 underline decoration-zinc-500 underline-offset-4 hover:text-white">
                Browse templates
              </Link>
            </div>
          </div>

          {featuredTemplate ? (
            <div className="mx-auto w-full max-w-sm rotate-1 border border-white/15 bg-white p-3 shadow-2xl sm:p-4">
              <Image
                src={featuredTemplate.thumbnailUrl}
                alt={featuredTemplate.title}
                width={featuredTemplate.layoutConfig.width}
                height={featuredTemplate.layoutConfig.height}
                unoptimized
                priority
                className="aspect-[3/4] w-full object-cover"
              />
              <p className="px-1 pt-3 text-sm font-medium text-zinc-900">
                {featuredTemplate.title}
              </p>
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center border border-white/15 bg-zinc-900 text-sm text-zinc-400">
              Poster templates
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">
              Start with a design
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Available templates
            </h2>
          </div>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary">
            View all templates <ArrowRight size={16} />
          </Link>
        </div>

        {templates.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.slice(0, 3).map((template) => (
              <TemplateCard key={template._id} template={template} />
            ))}
          </div>
        ) : (
          <p className="border-y py-8 text-sm text-muted-foreground">
            Templates are not available right now. Please try again later.
          </p>
        )}
      </section>

      <section className="border-y bg-muted/40">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="text-sm font-medium text-primary">A simple process</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">How it works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div>
              <LayoutTemplate className="mb-4 size-7 text-primary" />
              <h3 className="font-semibold">1. Pick a template</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Choose a design for your campaign, tribute, or celebration.
              </p>
            </div>
            <div>
              <ImagePlus className="mb-4 size-7 text-primary" />
              <h3 className="font-semibold">2. Add your details</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Enter your message and upload the photos you want to include.
              </p>
            </div>
            <div>
              <Download className="mb-4 size-7 text-primary" />
              <h3 className="font-semibold">3. Download your poster</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Preview your finished poster and download it to share.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>Political Poster Maker</p>
        <div className="flex gap-5">
          <Link href="/templates" className="hover:text-foreground">
            Templates
          </Link>
          <Link href="/history" className="hover:text-foreground">
            My posters
          </Link>
        </div>
      </footer>
    </main>
  );
}
