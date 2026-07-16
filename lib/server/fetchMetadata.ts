// src/lib/server/fetchMetadata.ts

const BACKEND_URL = process.env.API_URL;
const API_KEY = process.env.X_API_KEY;

export async function fetchForMetadata<T>(path: string): Promise<T | null> {
  if (!BACKEND_URL || !API_KEY) {
    console.error("[metadata] API_URL or X_API_KEY not set");
    return null;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/${path}`, {
      headers: { X_Api_Key: API_KEY },
      next: { revalidate: 3600 }, // cache for 1hr, avoids hammering backend on every crawl
    });

    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[metadata] fetch failed for ${path}:`, err);
    return null;
  }
}
