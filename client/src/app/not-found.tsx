import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">
          404
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
          The page or poster you were looking for may have moved, been removed, or
          never existed.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className={buttonVariants({ variant: "default", size: "lg" })}>
            Back to home
          </Link>
          <Link
            href="/templates"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Browse templates
          </Link>
        </div>
      </div>
    </main>
  );
}
