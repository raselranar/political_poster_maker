"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getMyPosters } from "@/lib/api";
import type { Poster } from "@/types/poster";
import { Download, Eye } from "lucide-react";
import Image from "next/image";

const getCloudinaryDownloadUrl = (url: string, customName = "poster") => {
  if (!url) return "";

  const attachmentFlag = `fl_attachment:${customName}`;

  if (url.includes("/upload/") && !url.includes("fl_attachment")) {
    return url.replace("/upload/", `/upload/${attachmentFlag}/`);
  }

  return url;
};

export default function HistoryPage() {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please login to view your history.");
          return;
        }

        const result = await getMyPosters(token);

        setPosters(result.posters);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load history",
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  if (loading) {
    return <main className="p-10 text-center">Loading history...</main>;
  }

  if (error) {
    return <main className="p-10 text-center text-red-600">{error}</main>;
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Poster History</h1>

        <p className="mt-2 text-gray-600">
          View your previously generated posters.
        </p>
      </div>

      {posters.length === 0 ? (
        <div className="rounded-lg border p-10 text-center">
          <p>No posters yet.</p>

          <Link
            href="/templates"
            className="mt-4 inline-block rounded-lg bg-black px-5 py-3 text-white">
            Create Your First Poster
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posters.map((poster) => (
            <div
              key={poster._id}
              className="overflow-hidden rounded-xl border transition hover:shadow-lg">
              <Link href={`/posters/${poster._id}`}>
                {poster.generatedImageUrl ? (
                  <Image
                    width={600}
                    height={600}
                    src={poster.generatedImageUrl}
                    alt={`Poster for ${poster.formData.name}`}
                    className="aspect-3/4 w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-3/4 items-center justify-center bg-gray-100">
                    <span className="text-sm capitalize text-gray-500">
                      {poster.status}
                    </span>
                  </div>
                )}
              </Link>

              <div className="p-4">
                <h2 className="font-semibold">{poster.formData.name}</h2>

                <p className="mt-1 text-sm text-gray-600">
                  {poster.formData.headline}
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {new Date(poster.createdAt).toLocaleDateString()}
                  </p>

                  <span
                    className={`text-xs font-medium capitalize ${
                      poster.status === "completed"
                        ? "text-green-600"
                        : poster.status === "failed"
                          ? "text-red-600"
                          : "text-gray-500"
                    }`}>
                    {poster.status}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/posters/${poster._id}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-3 py-2 text-sm font-medium text-white">
                    <Eye className="size-4" />
                    View
                  </Link>

                  {poster.status === "completed" &&
                    poster.generatedImageUrl && (
                      <Link
                        href={getCloudinaryDownloadUrl(
                          poster.generatedImageUrl,
                          `poster-${poster._id}`,
                        )}
                        download
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium">
                        <Download className="size-4" />
                        Download
                      </Link>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
