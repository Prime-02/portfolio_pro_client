// portfolio-builder/components/sections/hero/editor-components/fonts.ts

export interface FontOption {
  family: string;
  category: FontCategory;
}

export type FontCategory =
  | "sans-serif"
  | "serif"
  | "monospace"
  | "display"
  | "handwriting";

export const FONT_CATEGORIES: { value: FontCategory | "all"; label: string }[] =
  [
    { value: "all", label: "All" },
    { value: "sans-serif", label: "Sans-serif" },
    { value: "serif", label: "Serif" },
    { value: "monospace", label: "Monospace" },
    { value: "display", label: "Display" },
    { value: "handwriting", label: "Handwriting" },
  ];

// Curated list — broad coverage across all categories, all load well via Google Fonts
export const FONT_LIST: FontOption[] = [
  // Sans-serif
  { family: "Inter", category: "sans-serif" },
  { family: "Roboto", category: "sans-serif" },
  { family: "Open Sans", category: "sans-serif" },
  { family: "Lato", category: "sans-serif" },
  { family: "Montserrat", category: "sans-serif" },
  { family: "Nunito", category: "sans-serif" },
  { family: "Poppins", category: "sans-serif" },
  { family: "Raleway", category: "sans-serif" },
  { family: "Urbanist", category: "sans-serif" },
  { family: "DM Sans", category: "sans-serif" },
  { family: "Plus Jakarta Sans", category: "sans-serif" },
  { family: "Outfit", category: "sans-serif" },
  { family: "Manrope", category: "sans-serif" },
  { family: "Figtree", category: "sans-serif" },
  { family: "Work Sans", category: "sans-serif" },
  { family: "Josefin Sans", category: "sans-serif" },
  { family: "Mulish", category: "sans-serif" },
  { family: "Rubik", category: "sans-serif" },
  { family: "Source Sans 3", category: "sans-serif" },
  { family: "Lexend", category: "sans-serif" },

  // Serif
  { family: "Playfair Display", category: "serif" },
  { family: "Merriweather", category: "serif" },
  { family: "Lora", category: "serif" },
  { family: "EB Garamond", category: "serif" },
  { family: "Cormorant Garamond", category: "serif" },
  { family: "Libre Baskerville", category: "serif" },
  { family: "PT Serif", category: "serif" },
  { family: "Crimson Text", category: "serif" },
  { family: "Bitter", category: "serif" },
  { family: "Spectral", category: "serif" },
  { family: "DM Serif Display", category: "serif" },
  { family: "Fraunces", category: "serif" },
  { family: "Newsreader", category: "serif" },
  { family: "Instrument Serif", category: "serif" },

  // Monospace
  { family: "Fira Code", category: "monospace" },
  { family: "JetBrains Mono", category: "monospace" },
  { family: "Source Code Pro", category: "monospace" },
  { family: "Roboto Mono", category: "monospace" },
  { family: "Space Mono", category: "monospace" },
  { family: "IBM Plex Mono", category: "monospace" },
  { family: "Inconsolata", category: "monospace" },
  { family: "Courier Prime", category: "monospace" },
  { family: "Oxanium", category: "monospace" },

  // Display
  { family: "Bebas Neue", category: "display" },
  { family: "Anton", category: "display" },
  { family: "Oswald", category: "display" },
  { family: "Righteous", category: "display" },
  { family: "Abril Fatface", category: "display" },
  { family: "Alfa Slab One", category: "display" },
  { family: "Bungee", category: "display" },
  { family: "Exo 2", category: "display" },
  { family: "Orbitron", category: "display" },
  { family: "Syne", category: "display" },
  { family: "Clash Display", category: "display" },
  { family: "Space Grotesk", category: "display" },
  { family: "Cabinet Grotesk", category: "display" },

  // Handwriting
  { family: "Dancing Script", category: "handwriting" },
  { family: "Pacifico", category: "handwriting" },
  { family: "Caveat", category: "handwriting" },
  { family: "Sacramento", category: "handwriting" },
  { family: "Great Vibes", category: "handwriting" },
  { family: "Satisfy", category: "handwriting" },
  { family: "Yellowtail", category: "handwriting" },
  { family: "Kalam", category: "handwriting" },
  { family: "Indie Flower", category: "handwriting" },
  { family: "Shadows Into Light", category: "handwriting" },
];

// Track loading promises to prevent duplicate requests and allow awaiting readiness
const loadingCache = new Map<string, Promise<void>>();

/**
 * Load a Google Font and return a promise that resolves when it's ready to use.
 * Uses document.fonts.load() to ensure the font is actually parsed and available.
 */
export function loadGoogleFont(family: string): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (!family) return Promise.resolve();

  const normalizedFamily = family.trim();
  if (loadingCache.has(normalizedFamily)) {
    return loadingCache.get(normalizedFamily)!;
  }

  const promise = new Promise<void>((resolve) => {
    const id = `gfont-${normalizedFamily.replace(/\s+/g, "-").toLowerCase()}`;

    // If link already exists, just wait for the font to be ready
    if (document.getElementById(id)) {
      document.fonts
        .load(`1em "${normalizedFamily}"`)
        .then(() => resolve())
        .catch(() => resolve());
      return;
    }

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    // Reduced to 2 weights (400, 700) to cut file size and load time significantly
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      normalizedFamily,
    )}:wght@400;700&display=swap`;

    link.onload = () => {
      // Wait for the browser to actually parse and make the font available
      document.fonts
        .load(`1em "${normalizedFamily}"`)
        .then(() => resolve())
        .catch(() => resolve());
    };

    link.onerror = () => resolve(); // Don't block forever on network error

    document.head.appendChild(link);
  });

  loadingCache.set(normalizedFamily, promise);
  return promise;
}
