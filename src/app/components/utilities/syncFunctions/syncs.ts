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
  const clamp = (value: number): number => Math.min(255, Math.max(0, value));

  let newR: number, newG: number, newB: number;

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
  const toHex = (value: number): string =>
    clamp(value).toString(16).padStart(2, "0");
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

// Helper type guards for better type safety
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

// Helper function with proper typing
export function isNumericString(value: unknown): value is string {
  if (typeof value !== "string") return false;
  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
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
export function convertNumericStrings<T>(input: T): T {
  // Handle array case
  if (isArray(input)) {
    return input.map((item) => convertNumericStrings(item)) as T;
  }

  // Handle object case
  if (isObject(input)) {
    const result: Record<string, unknown> = {};

    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
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
        } else if (isObject(value) || isArray(value)) {
          // Recursively handle nested objects or arrays
          result[key] = convertNumericStrings(value);
        } else {
          result[key] = value;
        }
      }
    }
    return result as T;
  }

  // Return non-object/array values as-is
  return input;
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
  T extends Record<string, unknown> | Record<string, unknown>[],
>(input: T): T {
  if (isArray(input)) {
    // Handle array of objects
    return input.map((obj) => {
      if (!isObject(obj)) {
        return obj;
      }

      const newObj: Record<string, unknown> = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== "") {
          newObj[key] = obj[key];
        }
      }
      return newObj;
    }) as T;
  } else if (isObject(input)) {
    // Handle single object
    const newObj: Record<string, unknown> = {};
    for (const key in input) {
      if (
        Object.prototype.hasOwnProperty.call(input, key) &&
        input[key] !== ""
      ) {
        newObj[key] = input[key];
      }
    }
    return newObj as T;
  }

  // Return the input as-is if it's neither an object nor an array
  return input;
}

// More specific type for hex validation
type HexColor = `#${string}`;

export function isValidHexCode(hex: string): hex is HexColor {
  // Regular expression to match valid hex color codes
  const hexRegex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  return hexRegex.test(hex);
}

export function isValidHexColorStrict(hex: string): hex is HexColor {
  // Test for #RRGGBB or #RGB formats (with # required)
  return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(hex);
}

// More specific typing for toast function
type ToastFunction = (message: string) => void;

/**
 * Validates that all required fields in a form object are filled.
 * Displays warning toasts for empty fields.
 *
 * @param {Object} form - The form object to validate
 * @param {function} toast - The toast notification function
 * @param {Array<string>} [allowedEmptyKeys=[]] - Array of keys that are allowed to be empty
 * @returns {boolean} True if all required fields are valid, false otherwise
 */
export function validateFields<T extends Record<string, unknown>>(
  form: T | null | undefined,
  allowedEmptyKeys: string[] = []
): form is T {
  // Handle null/undefined form
  if (!form) {
    console.error("Form object is null or undefined");
    return false;
  }

  // Convert form keys to array and validate each field
  return Object.keys(form).every((key) => {
    // Skip validation for allowed empty fields
    if (allowedEmptyKeys.includes(key)) {
      return true;
    }

    const value = form[key];

    // Check for empty strings, null, or undefined
    if (value === "" || value === null || value === undefined) {
      toast.warning(`Please fill in the ${key} field.`);
      return false;
    }

    // Optional: Check for empty arrays/objects if needed
    if (isArray(value) && value.length === 0) {
      toast.warning(`Please provide at least one item for ${key}.`);
      return false;
    }

    return true;
  });
}

// Additional type-safe utility functions for better development experience

/**
 * Type-safe object key checker
 */
export function hasOwnProperty<T extends Record<string, unknown>>(
  obj: T,
  key: string | number | symbol
): key is keyof T {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Type-safe deep clone function
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (isArray(obj)) {
    return obj.map((item) => deepClone(item)) as T;
  }

  if (isObject(obj)) {
    const cloned: Record<string, unknown> = {};
    for (const key in obj) {
      if (hasOwnProperty(obj, key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned as T;
  }

  return obj;
}

/**
 * Searches an array of objects for matches across specified keys or all keys.
 * @param searchString - The string to search for
 * @param array - Array of objects to search (optional, defaults to empty array)
 * @param keys - Key(s) to check (optional, searches all keys if omitted)
 * @param exactMatch - If true, requires exact match (default: false, partial match)
 * @returns First matching object or undefined
 */
export function findMatch<T extends Record<string, unknown>>(
  searchString: string,
  array: T[] = [],
  keys?: keyof T | Array<keyof T>,
  exactMatch: boolean = false
): T | undefined {
  // Early return for invalid cases
  if (!searchString || !array.length) return undefined;

  const lowerSearch = searchString.toLowerCase();
  const keysToCheck = keys
    ? Array.isArray(keys)
      ? keys
      : [keys]
    : (Object.keys(array[0]) as Array<keyof T>); // All keys if none specified

  return array.find((obj) =>
    keysToCheck.some((key) => {
      const value = obj[key];
      if (typeof value !== "string") return false;

      const lowerValue = value.toLowerCase();
      return exactMatch
        ? lowerValue === lowerSearch
        : lowerValue.includes(lowerSearch);
    })
  );
}

import { StaticImageData } from "next/image";
import { toast } from "../../toastify/Toastify";

export type ImageSource = string | StaticImageData | null | undefined;

export function getImageSrc(
  profilePicture: ImageSource
): string | StaticImageData {
  // Handle cases where profilePicture is null, undefined, or empty string
  if (!profilePicture) {
    return "/vectors/undraw_monitor_ypga.svg";
  }

  // Handle StaticImageData (imported images)
  if (typeof profilePicture !== "string") {
    return profilePicture;
  }

  // Handle string paths
  if (
    profilePicture.startsWith("/") ||
    profilePicture.startsWith("http://") ||
    profilePicture.startsWith("https://")
  ) {
    return profilePicture;
  }

  // Fallback to default image
  return "/vectors/undraw_monitor_ypga.svg";
}

/**
 * Converts a base64 image string to a File object
 * @param base64String - The base64-encoded image string (including data URI prefix)
 * @param filename - The name for the resulting file
 * @returns A Promise that resolves to a File object
 */
export async function base64ToFile(
  base64String: string,
  filename: string
): Promise<File> {
  // Extract the content type and base64 data from the string
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);

  if (!matches || matches.length !== 3) {
    throw new Error(
      "Invalid base64 string format. Expected format: data:<content-type>;base64,<data>"
    );
  }

  const contentType = matches[1];
  const base64Data = matches[2];

  // Convert base64 to binary
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Create a Blob and then a File from it
  const blob = new Blob([bytes], { type: contentType });
  return new File([blob], filename, { type: contentType });
}

// Example usage:
// const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...';
// base64ToFile(base64Image, 'image.png').then(file => {
//   console.log('File created:', file);
// });

// Type definitions
interface Geometry {
  Point: [number, number];
}

interface Place {
  Label: string;
  Country: string;
  Region: string;
  Municipality: string | null;
  Geometry: Geometry;
}

interface LocationData {
  PlaceId: string;
  Place: Place;
}

interface AddressItem {
  id: string;
  code: string;
}

function createAddressArray(locationData: LocationData[]): AddressItem[] {
  return locationData.map((item: LocationData) => {
    // Create a code from the place label - clean and format it
    const label: string = item.Place.Label;
    const code: string = label
      .replace(/,/g, "_") // Replace commas with underscores
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .replace(/[^\w_]/g, "") // Remove special characters except underscores
      .toUpperCase(); // Convert to uppercase

    return {
      id: code,
      code: code,
    };
  });
}

// Alternative version with country code suffix for better uniqueness
export function createAddressArrayWithCountry(
  locationData: LocationData[]
): AddressItem[] {
  return locationData.map((item: LocationData) => {
    const label: string = item.Place.Label;
    const country: string = item.Place.Country;

    // Create base code from label
    const baseCode: string = label
      .replace(/,/g, "_")
      .replace(/\s+/g, "_")
      .replace(/[^\w_]/g, "")
      .toUpperCase();

    // Append country code for uniqueness
    const code: string = `${baseCode}_${country}`;

    return {
      id: code,
      code: code,
    };
  });
}

export function generateSimpleId(): string {
  return "addr_" + Math.random().toString(36).substr(2, 9);
}
// Version with custom ID generation (UUID-style)
export function createAddressArrayWithUUID(
  locationData: LocationData[]
): AddressItem[] {
  return locationData.map((item: LocationData) => {
    const label: string = item.Place.Label;

    const code: string = label
      .replace(/,/g, "_")
      .replace(/\s+/g, "_")
      .replace(/[^\w_]/g, "")
      .toUpperCase();

    return {
      id: code,
      code: code,
    };
  });
}

// Usage example:
// Assuming your data is stored in a variable called 'locationData'
const locationData: LocationData[] = [
  {
    PlaceId: "",
    Place: {
      Label: "Niger Road, Umuahia, Abia, NGA",
      Country: "NGA",
      Region: "Abia",
      Municipality: "Umuahia",
      Geometry: {
        Point: [7.497642532431, 5.534536500671],
      },
    },
  },
  // ... rest of your data
];

// Call the function
export const addressArray: AddressItem[] = createAddressArray(locationData);

/**
 * Copies text to clipboard using the Clipboard API and logs success/error.
 * @param text - The string to copy to clipboard
 */
export function copyToClipboard(text: string): void {
  if (!navigator.clipboard) {
    console.error("Clipboard API not supported in this browser");
    return;
  }

  // Since Clipboard API is async, we handle success/error inside
  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast.info("Successfully copied to clipboard!");
    })
    .catch((err) => {
      console.error("❌ Failed to copy:", err);
    });
}

type UrlPart =
  | "full"
  | "host"
  | "path"
  | "pathSegment"
  | "origin"
  | "search"
  | "hash";

/**
 * Gets specific parts of the current page URL
 * @param part - What part of the URL to return
 * @param segmentIndex - When part='pathSegment', the index to retrieve (0-based)
 * @returns The requested URL part as a string
 */
export function getCurrentUrl(
  part: UrlPart = "full",
  segmentIndex?: number
): string {
  const url = new URL(window.location.href);

  switch (part) {
    case "full":
      return url.href;
    case "host":
      return url.host;
    case "origin":
      return url.origin;
    case "path":
      return url.pathname;
    case "pathSegment":
      return getPathSegment(url.pathname, segmentIndex);
    case "search":
      return url.search;
    case "hash":
      return url.hash;
    default:
      throw new Error(`Invalid URL part requested: ${part}`);
  }
}

function getPathSegment(pathname: string, index?: number): string {
  const segments = pathname.split("/").filter((segment) => segment !== "");

  if (index === undefined) {
    return segments.join("/");
  }

  if (index < 0 || index >= segments.length) {
    throw new Error(`Invalid path segment index: ${index}`);
  }

  return segments[index];
}

// // For URL: https://example.com/products/electronics/123?sort=price#reviews

// getCurrentUrl('full');      // "https://example.com/products/electronics/123?sort=price#reviews"
// getCurrentUrl('host');      // "example.com"
// getCurrentUrl('origin');    // "https://example.com"
// getCurrentUrl('path');      // "/products/electronics/123"
// getCurrentUrl('pathSegment');       // "products/electronics/123"
// getCurrentUrl('pathSegment', 0);    // "products"
// getCurrentUrl('pathSegment', 1);    // "electronics"
// getCurrentUrl('pathSegment', 2);    // "123"
// getCurrentUrl('search');    // "?sort=price"
// getCurrentUrl('hash');      // "#reviews"
