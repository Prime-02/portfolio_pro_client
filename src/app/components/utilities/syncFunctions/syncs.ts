/**
 * Generates a shade of a given hex color based on a percentage (1-100).
 * @param hex - The base color in hex format (e.g., "#05df72").
 * @param percent - A number between 1 (lightest) and 100 (darkest).
 * @returns The resulting shade in hex format.
 */
export function getColorShade(hex: string, percent: number = 10): string {
  // Validate inputs
  if (!/^#[0-9A-F]{6}$/i.test(hex)) {
    throw new Error('Invalid hex color format. Use "#RRGGBB".');
  }
  if (percent < 1 || percent > 100) {
    throw new Error("Percent must be between 1 and 100.");
  }

  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Calculate perceived brightness (0-1)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000 / 255;

  // Determine if we should lighten or darken based on current brightness
  const shouldDarken = brightness > 0.5;

  // Calculate new color components
  const factor = percent / 100;
  const clamp = (value: number) => Math.min(255, Math.max(0, value));

  let newR, newG, newB;

  if (shouldDarken) {
    // Darken the color by reducing each component
    newR = Math.round(r * (1 - factor));
    newG = Math.round(g * (1 - factor));
    newB = Math.round(b * (1 - factor));
  } else {
    // Lighten the color by increasing each component toward white
    newR = Math.round(r + (255 - r) * factor);
    newG = Math.round(g + (255 - g) * factor);
    newB = Math.round(b + (255 - b) * factor);
  }

  // Convert back to hex
  const toHex = (value: number) => clamp(value).toString(16).padStart(2, "0");
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

/**
 * Recursively converts numeric strings in objects and arrays to numbers while preserving certain string formats.
 *
 * @param input - The input value to process (can be an object, array, or primitive value)
 * @returns A new object/array with numeric strings converted to numbers, with the following exceptions:
 *          - Strings with leading zeros (e.g., "0123") are preserved as strings
 *          - Non-numeric strings remain unchanged
 *          - Other primitive values remain unchanged
 *
 * @example
 * // Basic usage with object
 * convertNumericStrings({ price: "12.99", count: "5", code: "0123" });
 * // Returns { price: 12.99, count: 5, code: "0123" }
 *
 * @example
 * // With nested structures
 * convertNumericStrings({
 *   items: ["10", "20.5"],
 *   meta: { version: "1.0", build: "0012" }
 * });
 * // Returns { items: [10, 20.5], meta: { version: 1.0, build: "0012" } }
 *
 * @example
 * // Preserves non-numeric strings and special cases
 * convertNumericStrings({ id: "123a", serial: "000123", temp: "98.6" });
 * // Returns { id: "123a", serial: "000123", temp: 98.6 }
 */

export const convertNumericStrings = (input: any): any => {
  // Handle array case
  if (Array.isArray(input)) {
    return input.map((item) => convertNumericStrings(item));
  }

  // Handle object case
  if (typeof input === "object" && input !== null) {
    const result: Record<string, any> = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        const value = input[key];

        // Check if the value is a string with leading zeros that we should preserve
        const shouldPreserveAsString =
          typeof value === "string" &&
          /^0\d+$/.test(value) &&
          !value.includes(".");

        if (isNumericString(value) && !shouldPreserveAsString) {
          const num = parseFloat(value);
          // Check if the string represents an integer (no decimal or .0)
          if (/^-?\d+$/.test(value) || /^-?\d+\.0+$/.test(value)) {
            result[key] = parseFloat(num.toFixed(2)); // Format as decimal
          } else {
            result[key] = num; // Keep as float
          }
        } else if (shouldPreserveAsString) {
          result[key] = value; // Preserve the string with leading zeros
        } else if (typeof value === "object" && value !== null) {
          // Recursively handle nested objects or arrays
          result[key] = convertNumericStrings(value);
        } else {
          result[key] = value;
        }
      }
    }
    return result;
  }

  // Return non-object/array values as-is
  return input;
};

// Helper function with proper TypeScript typing
export function isNumericString(value: any): value is string {
  if (typeof value !== "string") return false;
  return !isNaN(value as any) && !isNaN(parseFloat(value));
}

/**
 * Removes all key-value pairs from an object or array of objects where the value is an empty string ("").
 *
 * @template T - The type of the input object or array
 * @param {T} input - The input object or array to process
 * @returns {T} A new object or array with all empty string values removed
 *
 * @example
 * // Object example
 * const input = { name: "John", age: "", city: "New York" };
 * const result = removeEmptyStringValues(input);
 * console.log(result); // Output: { name: "John", city: "New York" }
 *
 * @example
 * // Array example
 * const input = [
 *   { name: "Alice", age: "", city: "London" },
 *   { name: "Bob", age: "30", city: "" }
 * ];
 * const result = removeEmptyStringValues(input);
 * console.log(result); // Output: [{ name: "Alice", city: "London" }, { name: "Bob", age: "30" }]
 */
export function removeEmptyStringValues<
  T extends Record<string, any> | Array<Record<string, any>>,
>(input: T): T {
  if (Array.isArray(input)) {
    // Handle array of objects
    return input.map((obj) => {
      const newObj: Record<string, any> = {};
      for (const key in obj) {
        if (obj[key] !== "") {
          newObj[key] = obj[key];
        }
      }
      return newObj;
    }) as T;
  } else if (typeof input === "object" && input !== null) {
    // Handle single object
    const newObj: Record<string, any> = {};
    for (const key in input) {
      if (input[key] !== "") {
        newObj[key] = input[key];
      }
    }
    return newObj as T;
  }

  // Return the input as-is if it's neither an object nor an array
  return input;
}

export function isValidHexCode(hex: string) {
  // Regular expression to match valid hex color codes
  const hexRegex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  return hexRegex.test(hex);
}
