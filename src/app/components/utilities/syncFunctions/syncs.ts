/**
 * Generates a shade of a given hex color based on a percentage (1-100).
 * @param hex - The base color in hex format (e.g., "#05df72").
 * @param percent - A number between 1 (lightest) and 100 (darkest).
 * @returns The resulting shade in hex format.
 */
export function getColorShade(hex: string, percent: number): string {
  // Validate inputs
  if (!/^#[0-9A-F]{6}$/i.test(hex)) {
    throw new Error('Invalid hex color format. Use "#RRGGBB".');
  }
  if (percent < 1 || percent > 100) {
    throw new Error('Percent must be between 1 and 100.');
  }

  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Calculate shade (1 = lightest, 100 = darkest)
  const factor = percent / 100;
  const newR = Math.round(r * (1 - factor) + 255 * factor * 0.9);
  const newG = Math.round(g * (1 - factor) + 255 * factor * 0.9);
  const newB = Math.round(b * (1 - factor) + 255 * factor * 0.9);

  // Ensure we never reach pure white or black
  const clamp = (value: number) => Math.min(255, Math.max(20, value));

  // Convert back to hex
  const toHex = (value: number) => clamp(value).toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}