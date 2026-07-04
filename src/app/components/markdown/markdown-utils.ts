// markdown-utils.ts
//
// Post-MDXEditor-migration version. MDXEditor owns markdown <-> WYSIWYG
// conversion internally (via its Lexical import/export visitors), so
// mdToHtml / htmlToMd / processAutoTransform / processSpaceAutoList are
// gone — that was the whole point of the migration.
//
// What's left is genuinely still needed by the app:
//  - extractCloudinaryPublicId: used both by the editor (delete-on-remove)
//    and anywhere else in the app that needs to map a Cloudinary URL back
//    to a public_id (e.g. cleanup jobs).
//  - extractImageUrls: NEW — replaces the DOM-based image tracking your
//    old editor did. Since MDXEditor gives us markdown strings (not a DOM
//    we can walk), we diff image URLs between the previous and next
//    markdown value to detect removed images.

/**
 * Extract the Cloudinary public_id from a delivery URL.
 * Handles the standard /upload/.../<public_id>.<ext> shape, with or
 * without transformation segments.
 */
export function extractCloudinaryPublicId(url: string): string | null {
  if (!url) return null;
  // Matches: .../upload/(v12345/)?(w_800,h_600,.../)?folder/name.ext
  const match = url.match(
    /\/upload\/(?:v\d+\/)?(?:[^/]+\/)*?([^/]+)\.\w+(?:\?.*)?$/,
  );
  if (!match) return null;

  // Reconstruct the folder-prefixed public_id (Cloudinary public_ids can
  // include folder segments, e.g. "blog/abc123").
  const uploadIdx = url.indexOf("/upload/");
  if (uploadIdx === -1) return null;
  let rest = url.slice(uploadIdx + "/upload/".length);
  rest = rest.replace(/^v\d+\//, ""); // strip version segment
  // Strip a leading transformation segment (contains a comma or starts
  // with a known transformation shorthand like "w_", "h_", "c_", "q_", "f_")
  rest = rest.replace(/^([a-z]_[^/,]+,?)+\//, "");
  rest = rest.replace(/\.\w+(\?.*)?$/, ""); // strip extension + query
  return rest || match[1];
}

/** Matches markdown image syntax `![alt](url)` and raw `<img src="url" .../>` */
const IMG_MARKDOWN_RE = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const IMG_HTML_RE = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/g;

/**
 * Extract every image URL referenced in a markdown string.
 * Used to diff before/after markdown and detect which images the user
 * removed, so we know what to delete from Cloudinary.
 */
export function extractImageUrls(markdown: string): string[] {
  if (!markdown) return [];
  const urls: string[] = [];
  for (const re of [IMG_MARKDOWN_RE, IMG_HTML_RE]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(markdown))) urls.push(m[1]);
  }
  return urls;
}

/**
 * Given the previous and next markdown value, return the list of image
 * URLs that were present before and are gone now (i.e. candidates for
 * Cloudinary deletion).
 */
export function diffRemovedImageUrls(
  prevMarkdown: string,
  nextMarkdown: string,
): string[] {
  const prev = new Set(extractImageUrls(prevMarkdown));
  const next = new Set(extractImageUrls(nextMarkdown));
  return [...prev].filter((url) => !next.has(url));
}
