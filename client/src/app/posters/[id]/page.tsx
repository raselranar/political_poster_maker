"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPoster, regeneratePoster } from "@/lib/api";
import Image from "next/image";
import { Poster } from "@/app/history/page";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Search } from "lucide-react";

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
  const [regenerating, setRegenerating] = useState(false);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const posterId = params.id as string;

  const [poster, setPoster] = useState<Poster | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const loadPoster = async () => {
      try {
        const result = await getPoster(posterId, token);

        setPoster(result.poster);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load poster",
        );
      } finally {
        setLoading(false);
      }
    };

    loadPoster();
  }, [posterId, router]);

  if (loading) {
    return <main className="p-10 text-center">Loading poster...</main>;
  }

  if (error) {
    return <main className="p-10 text-center text-red-600">{error}</main>;
  }

  if (!poster) {
    return <main className="p-10 text-center">Poster not found.</main>;
  }

  const handleRegenerate = async () => {
    const token = localStorage.getItem("token");

    if (!token || !poster) {
      return;
    }

    try {
      setRegenerating(true);
      setError("");

      await regeneratePoster(poster._id, token);

      /*
       * Poll until generation finishes.
       */
      let attempts = 0;

      const poll = async (): Promise<void> => {
        attempts++;

        const result = await getPoster(poster._id, token);

        setPoster(result.poster);

        if (result.poster.status === "completed") {
          setRegenerationCount(result.poster.regenerationCount ?? 0);

          setRegenerating(false);

          return;
        }

        if (result.poster.status === "failed") {
          throw new Error(result.poster.errorMessage || "Regeneration failed");
        }

        if (attempts >= 30) {
          throw new Error("Regeneration is taking too long.");
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));

        return poll();
      };

      await poll();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Regeneration failed");

      setRegenerating(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-3xl font-bold">Poster Preview</h1>

      <p className="mb-8 text-gray-600">{poster.formData.headline}</p>

      {poster.status === "generating" && (
        <div className="rounded-lg border p-8 text-center">
          <p className="font-medium">Your poster is being generated...</p>

          <p className="mt-2 text-sm text-gray-500">Please wait.</p>
        </div>
      )}

      {poster.status === "failed" && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-red-700">
          {poster.errorMessage || "Poster generation failed."}
        </div>
      )}

      {poster.status === "completed" && poster.generatedImageUrl && (
        <div>
          <Image
            width={600}
            height={600}
            src={poster.generatedImageUrl}
            alt="Generated poster"
            className="mx-auto w-full max-w-xl rounded-lg shadow-xl"
          />

          <div className="mt-6 flex gap-3">
            <Link
              href={poster.generatedImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex gap-2 justify-center rounded-lg bg-black px-5 py-3 text-center font-medium text-white">
              <Search />
              Open Full Resolution
            </Link>

            <Link
              href={getCloudinaryDownloadUrl(poster.generatedImageUrl)}
              download="poster.png"
              className="flex-1 flex gap-2 rounded-lg justify-center border px-5 py-3 text-center font-medium">
              <Download />
              Download PNG
            </Link>
          </div>
          <div className="mt-4 flex flex-col items-center">
            <Button
              onClick={handleRegenerate}
              disabled={regenerating || regenerationCount >= 3}
              className="rounded-full flex gap-2 px-6 py-5 cursor-pointer text-md font-medium transition-all duration-200  active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
              <RefreshCw className="size-5" />
              {regenerating
                ? "Regenerating..."
                : regenerationCount >= 3
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
