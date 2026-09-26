"use client";

import Link from "next/link";
import { useEffect } from "react";

import { buttonVariants } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-destructive">
          Error
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Something went wrong
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
          We couldn&apos;t load this page because of an unexpected error. You can retry
          or return to the dashboard.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className={buttonVariants({ variant: "default", size: "lg" })}
          >
            Try again
          </button>
          <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
