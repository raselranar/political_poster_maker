"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPoster } from "@/lib/api";
import Image from "next/image";
import { Poster } from "@/app/history/page";
import Link from "next/link";

export default function PosterPreviewPage() {
  const params = useParams();
  const router = useRouter();

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
            width={300}
            height={300}
            src={poster.generatedImageUrl}
            alt="Generated poster"
            className="mx-auto w-full max-w-xl rounded-lg shadow-xl"
          />

          <div className="mt-6 flex gap-3">
            <Link
              href={poster.generatedImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg bg-black px-5 py-3 text-center font-medium text-white">
              Open Full Resolution
            </Link>

            <Link
              href={poster.generatedImageUrl}
              download
              className="flex-1 rounded-lg border px-5 py-3 text-center font-medium">
              Download PNG
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
