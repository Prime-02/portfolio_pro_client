// lib/cloudinary/helpers.ts
// Client-safe helpers — no secrets, only public_id transformations
// These run on both server and client

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

// ── Build a Cloudinary URL from a public_id with transformations ──────────────
export function getImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "scale" | "thumb" | "crop";
    quality?: number | "auto";
    format?: "auto" | "webp" | "jpg" | "png" | "avif";
    gravity?: "auto" | "face" | "center";
  } = {},
): string {
  if (!publicId) return "";

  const {
    width,
    height,
    crop = "fill",
    quality = "auto",
    format = "auto",
    gravity = "auto",
  } = options;

  const transforms: string[] = [
    `f_${format}`,
    `q_${quality}`,
    crop && `c_${crop}`,
    gravity && `g_${gravity}`,
    width && `w_${width}`,
    height && `h_${height}`,
  ].filter(Boolean) as string[];

  return `${BASE_URL}/${transforms.join(",")}/${publicId}`;
}

// ── Preset helpers for common use cases ───────────────────────────────────────

/** Profile photo — square, face-focused */
export function getProfilePhotoUrl(publicId: string, size = 400): string {
  return getImageUrl(publicId, {
    width: size,
    height: size,
    crop: "fill",
    gravity: "face",
  });
}

/** Cover / hero photo — wide banner */
export function getCoverPhotoUrl(
  publicId: string,
  width = 1400,
  height = 600,
): string {
  return getImageUrl(publicId, {
    width,
    height,
    crop: "fill",
    gravity: "auto",
  });
}

/** Project cover — card thumbnail */
export function getProjectCoverUrl(
  publicId: string,
  width = 800,
  height = 450,
): string {
  return getImageUrl(publicId, { width, height, crop: "fill" });
}

/** Blog post cover */
export function getBlogCoverUrl(
  publicId: string,
  width = 1200,
  height = 630,
): string {
  return getImageUrl(publicId, { width, height, crop: "fill" });
}

/** Company / institution logo — square, transparent-friendly */
export function getLogoUrl(publicId: string, size = 120): string {
  return getImageUrl(publicId, {
    width: size,
    height: size,
    crop: "fit",
    format: "auto",
  });
}

/** Avatar (testimonial) — small square */
export function getAvatarUrl(publicId: string, size = 80): string {
  return getImageUrl(publicId, {
    width: size,
    height: size,
    crop: "fill",
    gravity: "face",
  });
}

// ── Check if a string is a Cloudinary public_id (vs a plain URL) ─────────────
export function isCloudinaryId(value: string): boolean {
  return Boolean(value) && !value.startsWith("http");
}

// ── Resolve — returns the correct URL whether given a public_id or raw URL ────
export function resolveImageUrl(
  value: string | null | undefined,
  options: Parameters<typeof getImageUrl>[1] = {},
): string {
  if (!value) return "";
  if (!isCloudinaryId(value)) return value; // already a URL
  return getImageUrl(value, options);
}
