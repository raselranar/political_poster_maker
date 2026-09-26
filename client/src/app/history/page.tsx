"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyPosters } from "@/lib/api";

export interface Poster {
  _id: string;
  generatedImageUrl?: string;
  status: "draft" | "generating" | "completed" | "failed";
  errorMessage?: string;
  formData: {
    name: string;
    headline: string;
  };
}
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
            <Link
              key={poster._id}
              href={`/posters/${poster._id}`}
              className="overflow-hidden rounded-xl border transition hover:shadow-lg">
              {poster.generatedImageUrl ? (
                <img
                  src={poster.generatedImageUrl}
                  alt="Poster"
                  className="aspect-[3/4] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center bg-gray-100">
                  <span className="text-gray-500">{poster.status}</span>
                </div>
              )}

              <div className="p-4">
                <h2 className="font-semibold">{poster.formData.name}</h2>

                <p className="mt-1 text-sm text-gray-600">
                  {poster.formData.headline}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  {new Date(poster.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
