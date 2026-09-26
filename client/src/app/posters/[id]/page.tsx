"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPoster, regeneratePoster } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Search } from "lucide-react";
import { Poster } from "@/types/poster";

const getCloudinaryDownloadUrl = (url: string, customName = "my-poster") => {
  if (!url) return "";

  const attachmentFlag = `fl_attachment:${customName}`;

  if (url.includes("/upload/") && !url.includes("fl_attachment")) {
    return url.replace("/upload/", `/upload/${attachmentFlag}/`);
  }

  return url;
};

export default function PosterPreviewPage() {
  const params = useParams();
  const router = useRouter();

  const posterId = params.id as string;

  const [poster, setPoster] = useState<Poster | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");

  const loadPoster = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const result = await getPoster(posterId, token);

      setPoster(result.poster);
      setError("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load poster",
      );
    } finally {
      setLoading(false);
    }
  }, [posterId, router]);

  useEffect(() => {
    loadPoster();
  }, [loadPoster]);

  /*
   * Poll while poster is being generated.
   */
  useEffect(() => {
    if (poster?.status !== "generating") {
      return;
    }

    const interval = setInterval(() => {
      loadPoster();
    }, 3000);

    return () => clearInterval(interval);
  }, [poster?.status, loadPoster]);

  const handleRegenerate = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (!poster) {
      return;
    }

    if (poster.regenerationCount >= 3) {
      setError("Maximum regeneration limit reached.");
      return;
    }

    try {
      setRegenerating(true);
      setError("");

      const result = await regeneratePoster(posterId, token);

      setPoster((current) => {
        if (!current) return current;

        return {
          ...current,
          status: result.poster.status,
          regenerationCount: result.poster.regenerationCount,
        };
      });
    } catch (error) {
      console.error("Regeneration error:", error);

      setError(
        error instanceof Error ? error.message : "Failed to regenerate poster.",
      );
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return <main className="p-10 text-center">Loading poster...</main>;
  }

  if (error && !poster) {
    return <main className="p-10 text-center text-red-600">{error}</main>;
  }

  if (!poster) {
    return <main className="p-10 text-center">Poster not found.</main>;
  }

  const regenerationCount = poster.regenerationCount ?? 0;

  const regenerationLimitReached = regenerationCount >= 3;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-3xl font-bold">Poster Preview</h1>

      <p className="mb-8 text-gray-600">{poster.formData.headline}</p>

      {error && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {poster.status === "generating" && (
        <div className="rounded-lg border p-8 text-center">
          <RefreshCw className="mx-auto mb-4 size-8 animate-spin" />

          <p className="font-medium">Your poster is being generated...</p>

          <p className="mt-2 text-sm text-gray-500">
            Please wait. This page will update automatically.
          </p>
        </div>
      )}

      {poster.status === "failed" && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-red-700">
          <p className="font-medium">Poster generation failed.</p>

          <p className="mt-2 text-sm">
            {poster.errorMessage ||
              "Something went wrong while generating your poster."}
          </p>
        </div>
      )}

      {poster.status === "completed" && poster.generatedImageUrl && (
        <div>
          <Image
            width={1200}
            height={1600}
            src={poster.generatedImageUrl}
            alt="Generated poster"
            className="mx-auto h-auto w-full max-w-xl rounded-lg shadow-xl"
          />

          <div className="mt-6 flex gap-3">
            <Link
              href={poster.generatedImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-center font-medium text-white">
              <Search className="size-5" />
              Open Full Resolution
            </Link>

            <Link
              href={getCloudinaryDownloadUrl(
                poster.generatedImageUrl,
                `poster-${poster._id}`,
              )}
              download
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-5 py-3 text-center font-medium">
              <Download className="size-5" />
              Download PNG
            </Link>
          </div>

          <div className="mt-6 flex flex-col items-center">
            <Button
              onClick={handleRegenerate}
              disabled={regenerating || regenerationLimitReached}
              className="flex cursor-pointer gap-2 rounded-full px-6 py-5 text-md font-medium transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
              <RefreshCw
                className={regenerating ? "size-5 animate-spin" : "size-5"}
              />

              {regenerating
                ? "Regenerating..."
                : regenerationLimitReached
                  ? "Regeneration Limit Reached"
                  : "Regenerate Poster"}
            </Button>

            <p className="mt-2 text-center text-sm text-gray-500">
              {regenerationCount}/3 regenerations used
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
