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

import { toast } from "../../toastify/Toastify";

export type ImageSource = string | null | undefined;

export function getImageSrc(
  profilePicture: ImageSource,
  initials: string = "User"
): string {
  // Handle cases where profilePicture is null, undefined, or empty string
  if (!profilePicture) {
    return `https://avatar.oxro.io/avatar.svg?name=${initials.toUpperCase()}`;
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
  return `https://avatar.oxro.io/avatar.svg?name=${initials?.toUpperCase()}`;
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

import copy from "clipboard-copy";

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await copy(text);
    toast.info("Successfully copied to clipboard!", {
      title: "Copied",
    });
  } catch (err) {
    console.error("❌ Failed to copy:", err);
    toast.error("Failed to copy to clipboard", {
      title: "Copy Failed",
    });
  }
}

type UrlPart =
  | "full"
  | "host"
  | "path"
  | "pathSegment"
  | "origin"
  | "search"
  | "lastPathSegment"
  | "hash";

/**
 * Gets specific parts of the current page URL
 * @param part - What part of the URL to return
 * @param segmentIndex - When part='pathSegment', the index to retrieve (0-based)
 * @returns The requested URL part as a string
 */
//This utility function is now depreciated, use The PathUtil class for all path operations
export function getCurrentUrl(
  part: UrlPart = "full",
  segmentIndex?: number
): string {
  // Check if running in a browser environment
  if (typeof window === "undefined") {
    return "";
  }

  try {
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
      case "lastPathSegment":
        return getLastPathSegment(url.pathname);
      case "search":
        return url.search;
      case "hash":
        return url.hash;
      default:
        throw new Error(`Invalid URL part requested: ${part}`);
    }
  } catch (error) {
    console.error("Error parsing URL:", error);
    return "";
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

function getLastPathSegment(pathname: string): string {
  const segments = pathname.split("/").filter((segment) => segment !== "");
  return segments.length > 0 ? segments[segments.length - 1] : "";
}

// Example usage with URL: https://example.com/products/electronics/123?sort=price#reviews
// getCurrentUrl('full');             // "https://example.com/products/electronics/123?sort=price#reviews"
// getCurrentUrl('host');             // "example.com"
// getCurrentUrl('origin');           // "https://example.com"
// getCurrentUrl('path');             // "/products/electronics/123"
// getCurrentUrl('pathSegment');      // "products/electronics/123"
// getCurrentUrl('pathSegment', 0);   // "products"
// getCurrentUrl('pathSegment', 1);   // "electronics"
// getCurrentUrl('pathSegment', 2);   // "123"
// getCurrentUrl('lastPathSegment');  // "123"
// getCurrentUrl('search');           // "?sort=price"
// getCurrentUrl('hash');             // "#reviews"
export function validateUsername(username: string): {
  valid: boolean;
  message?: string;
} {
  // Check if input is a string
  if (typeof username !== "string") {
    return { valid: false, message: "Username must be a string" };
  }

  username = username.trim();

  // Length check (2-32 chars)
  if (username.length < 2 || username.length > 32) {
    return {
      valid: false,
      message: "Username must be between 2-32 characters",
    };
  }

  // Allowed characters (alphanumeric + common special chars)
  const allowedCharsRegex = /^[a-zA-Z0-9_\-\.@!#$%&*+=\[\]\^|~: ]+$/;
  if (!allowedCharsRegex.test(username)) {
    return {
      valid: false,
      message:
        "Contains invalid characters. Only letters, numbers, and _-.@!#$%&*+=[]^|~: are allowed",
    };
  }

  // Cannot start/end with certain special chars (., -, _, @)
  const invalidStartEndRegex = /^[.\-_@]|.*[.\-_@]$/;
  if (invalidStartEndRegex.test(username)) {
    return { valid: false, message: "Cannot start or end with ., -, _, or @" };
  }

  // No consecutive spaces
  if (username.includes("  ")) {
    return { valid: false, message: "Cannot contain consecutive spaces" };
  }

  // Reserved words (case-insensitive check)
  const reservedWords = new Set([
    "admin",
    "administrator",
    "root",
    "system",
    "null",
    "undefined",
    "moderator",
    "guest",
    "user",
    "owner",
    "me",
    "self",
  ]);
  if (reservedWords.has(username.toLowerCase())) {
    return {
      valid: false,
      message: "This username is reserved and cannot be used",
    };
  }

  return { valid: true };
}

/**
 * Downloads a video or image file from a URL
 * @param url - The URL of the media file to download
 * @param filename - Optional custom filename for the downloaded file
 * @returns Promise that resolves when download is complete
 */
export async function downloadMediaFile(
  url: string,
  filename?: string
): Promise<void> {
  try {
    // Validate URL format
    let urlObj: URL;
    try {
      urlObj = new URL(url);
    } catch {
      throw new Error("Invalid URL format");
    }

    // Fetch the file with appropriate headers
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "image/*,video/*",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch file: ${response.status} ${response.statusText}`
      );
    }

    // Check if it's actually a video or image
    const contentType = response.headers.get("content-type") || "";
    if (
      !contentType.startsWith("image/") &&
      !contentType.startsWith("video/")
    ) {
      throw new Error(
        `File is not a video or image. Content-Type: ${contentType}`
      );
    }

    // Get the blob data
    const blob = await response.blob();

    // Determine filename with better extension mapping
    let finalFilename = filename;
    if (!finalFilename) {
      finalFilename = urlObj.pathname.split("/").pop() || "download";

      // Remove query parameters from extracted filename
      finalFilename = finalFilename.split("?")[0];

      // If there's no extension, determine from content type
      if (!finalFilename.includes(".")) {
        const extension = getExtensionFromContentType(contentType);
        if (extension) {
          finalFilename += `.${extension}`;
        } else {
          finalFilename += ".bin"; // fallback
        }
      }
    }

    // Create blob URL and trigger download
    const blobUrl = URL.createObjectURL(blob);

    // Create and trigger download
    const a = document.createElement("a");
    a.style.display = "none"; // Hide the anchor element
    a.href = blobUrl;
    a.download = finalFilename;

    // Add to DOM, click, then remove
    document.body.appendChild(a);
    a.click();

    // Clean up immediately after click
    document.body.removeChild(a);

    // Clean up blob URL after a short delay to ensure download starts
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 1000);
  } catch (error) {
    console.error("Error downloading media file:", error);
    throw error;
  }
}

/**
 * Maps content-type to appropriate file extension
 */
function getExtensionFromContentType(contentType: string): string {
  const typeMap: Record<string, string> = {
    // Images
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/bmp": "bmp",
    "image/tiff": "tiff",
    "image/avif": "avif",

    // Videos
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/ogg": "ogv",
    "video/avi": "avi",
    "video/mov": "mov",
    "video/wmv": "wmv",
    "video/flv": "flv",
    "video/mkv": "mkv",
    "video/m4v": "m4v",
    "video/3gpp": "3gp",
    "video/quicktime": "mov",
  };

  return typeMap[contentType.toLowerCase()] || "";
}

// Example usage:
// downloadMediaFile('https://example.com/video.mp4', 'my-video.mp4');
// downloadMediaFile('https://example.com/image.jpg'); // Will use original filename

/**
 * Enhanced path utility with comprehensive segment manipulation
 */

export class PathUtil {
  /**
   * Normalizes a path by removing leading/trailing slashes and cleaning up empty segments
   */
  private static normalizePath(path: string): string {
    return path.replace(/^\/+|\/+$/g, "").replace(/\/+/g, "/");
  }

  /**
   * Splits a path into segments, handling edge cases
   */
  private static getSegments(path: string): string[] {
    const normalized = this.normalizePath(path);
    if (!normalized) return [];
    return normalized.split("/").filter((segment) => segment.length > 0);
  }

  /**
   * Gets a specific path segment by index
   * @param currentPath - The path to extract from
   * @param index - Zero-based index of the segment to retrieve
   * @returns The segment at the specified index, or empty string if not found
   */
  static getPathSegment(currentPath: string, index: number): string {
    const segments = this.getSegments(currentPath);
    if (index < 0 || index >= segments.length) {
      return "";
    }
    return segments[index];
  }

  /**
   * Gets the last segment of a path
   * @param currentPath - The path to extract from
   * @returns The last segment or empty string if path is empty
   */
  static getLastSegment(currentPath: string): string {
    const segments = this.getSegments(currentPath);
    return segments.length > 0 ? segments[segments.length - 1] : "";
  }

  /**
   * Gets the first segment of a path
   * @param currentPath - The path to extract from
   * @returns The first segment or empty string if path is empty
   */
  static getFirstSegment(currentPath: string): string {
    const segments = this.getSegments(currentPath);
    return segments.length > 0 ? segments[0] : "";
  }

  /**
   * Removes a path segment by index
   * @param currentPath - The path to modify
   * @param index - Zero-based index of the segment to remove
   * @returns New path with the segment removed
   */
  static removeSegmentByIndex(currentPath: string, index: number): string {
    const segments = this.getSegments(currentPath);
    if (index < 0 || index >= segments.length) {
      return currentPath;
    }
    segments.splice(index, 1);
    return segments.length > 0 ? `/${segments.join("/")}` : "/";
  }

  /**
   * Removes the first occurrence of a segment by value
   * @param currentPath - The path to modify
   * @param segmentValue - The segment value to remove
   * @returns New path with the first matching segment removed
   */
  static removeSegmentByValue(
    currentPath: string,
    segmentValue: string
  ): string {
    const segments = this.getSegments(currentPath);
    const index = segments.indexOf(segmentValue);
    if (index === -1) {
      return currentPath;
    }
    segments.splice(index, 1);
    return segments.length > 0 ? `/${segments.join("/")}` : "/";
  }

  /**
   * Removes all occurrences of a segment by value
   * @param currentPath - The path to modify
   * @param segmentValue - The segment value to remove
   * @returns New path with all matching segments removed
   */
  static removeAllSegmentsByValue(
    currentPath: string,
    segmentValue: string
  ): string {
    const segments = this.getSegments(currentPath);
    const filtered = segments.filter((segment) => segment !== segmentValue);
    return filtered.length > 0 ? `/${filtered.join("/")}` : "/";
  }

  /**
   * Removes the last segment from a path
   * @param currentPath - The path to modify
   * @returns New path with the last segment removed
   */
  static removeLastSegment(currentPath: string): string {
    const segments = this.getSegments(currentPath);
    if (segments.length === 0) {
      return currentPath;
    }
    segments.pop();
    return segments.length > 0 ? `/${segments.join("/")}` : "/";
  }

  /**
   * Removes the first segment from a path
   * @param currentPath - The path to modify
   * @returns New path with the first segment removed
   */
  static removeFirstSegment(currentPath: string): string {
    const segments = this.getSegments(currentPath);
    if (segments.length === 0) {
      return currentPath;
    }
    segments.shift();
    return segments.length > 0 ? `/${segments.join("/")}` : "/";
  }

  /**
   * Adds a segment at a specific index
   * @param currentPath - The path to modify
   * @param index - Zero-based index where to insert the segment
   * @param segmentValue - The segment to add
   * @returns New path with the segment added
   */
  static addSegmentAtIndex(
    currentPath: string,
    index: number,
    segmentValue: string
  ): string {
    const segments = this.getSegments(currentPath);
    const clampedIndex = Math.max(0, Math.min(index, segments.length));
    segments.splice(clampedIndex, 0, segmentValue);
    return `/${segments.join("/")}`;
  }

  /**
   * Replaces a segment at a specific index
   * @param currentPath - The path to modify
   * @param index - Zero-based index of the segment to replace
   * @param newValue - The new segment value
   * @returns New path with the segment replaced
   */
  static replaceSegmentAtIndex(
    currentPath: string,
    index: number,
    newValue: string
  ): string {
    const segments = this.getSegments(currentPath);
    if (index < 0 || index >= segments.length) {
      return currentPath;
    }
    segments[index] = newValue;
    return `/${segments.join("/")}`;
  }

  /**
   * Gets all segments as an array
   * @param currentPath - The path to split
   * @returns Array of path segments
   */
  static getAllSegments(currentPath: string): string[] {
    return this.getSegments(currentPath);
  }

  /**
   * Gets the number of segments in a path
   * @param currentPath - The path to count
   * @returns Number of segments
   */
  static getSegmentCount(currentPath: string): number {
    return this.getSegments(currentPath).length;
  }

  /**
   * Checks if a path contains a specific segment
   * @param currentPath - The path to search
   * @param segmentValue - The segment to look for
   * @returns True if the segment exists in the path
   */
  static hasSegment(currentPath: string, segmentValue: string): boolean {
    return this.getSegments(currentPath).includes(segmentValue);
  }

  /**
   * Gets a range of segments
   * @param currentPath - The path to extract from
   * @param startIndex - Starting index (inclusive)
   * @param endIndex - Ending index (exclusive, optional)
   * @returns Array of segments in the specified range
   */
  static getSegmentRange(
    currentPath: string,
    startIndex: number,
    endIndex?: number
  ): string[] {
    const segments = this.getSegments(currentPath);
    return segments.slice(startIndex, endIndex);
  }

  /**
   * Builds a path from segments
   * @param segments - Array of segments to join
   * @returns Complete path string
   */
  static buildPath(segments: string[]): string {
    const filtered = segments.filter(
      (segment) => segment && segment.length > 0
    );
    return filtered.length > 0 ? `/${filtered.join("/")}` : "/";
  }

  /**
   * Parses query parameters from a URL or query string
   * @param input - Full URL or just the query string (with or without ?)
   * @returns Object with query parameters as key-value pairs
   */
  static parseQueryParams(input: string): Record<string, string | string[]> {
    const queryString = input.includes("?") ? input.split("?")[1] : input;
    if (!queryString) return {};

    const params: Record<string, string | string[]> = {};
    const searchParams = new URLSearchParams(queryString);

    for (const [key, value] of searchParams.entries()) {
      if (params[key]) {
        // Handle multiple values for the same key
        if (Array.isArray(params[key])) {
          (params[key] as string[]).push(value);
        } else {
          params[key] = [params[key] as string, value];
        }
      } else {
        params[key] = value;
      }
    }

    return params;
  }

  /**
   * Builds a query string from an object
   * @param params - Object with key-value pairs for query parameters
   * @param includeQuestionMark - Whether to include the leading ? (default: true)
   * @returns Query string
   */
  static buildQueryString(
    params: Record<
      string,
      string | number | boolean | string[] | null | undefined
    >,
    includeQuestionMark: boolean = true
  ): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return; // Skip null/undefined values
      }

      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString
      ? includeQuestionMark
        ? `?${queryString}`
        : queryString
      : "";
  }

  /**
   * Builds a complete URL with path and query parameters
   * @param basePath - The base path/route
   * @param queryParams - Object with query parameters
   * @returns Complete URL string
   */
  static buildUrlWithQuery(
    basePath: string,
    queryParams: Record<
      string,
      string | number | boolean | string[] | null | undefined
    >
  ): string {
    const normalizedPath = basePath.startsWith("/") ? basePath : `/${basePath}`;
    const queryString = this.buildQueryString(queryParams, true);
    return `${normalizedPath}${queryString}`;
  }

  /**
   * Adds query parameters to an existing URL
   * @param currentUrl - The current URL (with or without existing query params)
   * @param newParams - New query parameters to add
   * @param overwrite - Whether to overwrite existing parameters (default: false)
   * @returns URL with added query parameters
   */
  static addQueryParams(
    currentUrl: string,
    newParams: Record<
      string,
      string | number | boolean | string[] | null | undefined
    >,
    overwrite: boolean = true
  ): string {
    const [basePath, existingQuery] = currentUrl.split("?");
    const existingParams = existingQuery
      ? this.parseQueryParams(existingQuery)
      : {};

    const mergedParams = overwrite
      ? { ...existingParams, ...newParams }
      : { ...newParams, ...existingParams };

    return this.buildUrlWithQuery(basePath, mergedParams);
  }

  /**
   * Removes specific query parameters from a URL
   * @param currentUrl - The current URL
   * @param paramsToRemove - Array of parameter keys to remove
   * @returns URL with specified parameters removed
   */
  static removeQueryParams(
    currentUrl: string,
    paramsToRemove: string[]
  ): string {
    const [basePath, existingQuery] = currentUrl.split("?");
    if (!existingQuery) return basePath;

    const existingParams = this.parseQueryParams(existingQuery);
    const filteredParams: Record<string, string | string[]> = {};

    Object.entries(existingParams).forEach(([key, value]) => {
      if (!paramsToRemove.includes(key)) {
        filteredParams[key] = value;
      }
    });

    const queryString = this.buildQueryString(filteredParams, true);
    return `${basePath}${queryString}`;
  }

  /**
   * Updates specific query parameters in a URL
   * @param currentUrl - The current URL
   * @param updates - Object with parameters to update/add
   * @returns URL with updated parameters
   */
  static updateQueryParams(
    currentUrl: string,
    updates: Record<
      string,
      string | number | boolean | string[] | null | undefined
    >
  ): string {
    return this.addQueryParams(currentUrl, updates, true);
  }

  /**
   * Gets a specific query parameter value from a URL
   * @param url - The URL to extract from
   * @param paramName - The parameter name to get
   * @returns The parameter value or null if not found
   */
  static getQueryParam(
    url: string,
    paramName: string
  ): string | string[] | null {
    const params = this.parseQueryParams(url);
    return params[paramName] || null;
  }

  /**
   * Checks if a URL has a specific query parameter
   * @param url - The URL to check
   * @param paramName - The parameter name to look for
   * @returns True if the parameter exists
   */
  static hasQueryParam(url: string, paramName: string): boolean {
    const params = this.parseQueryParams(url);
    return paramName in params;
  }

  /**
   * Clears all query parameters from a URL
   * @param currentUrl - The current URL
   * @returns URL with all query parameters removed
   */
  static clearQueryParams(currentUrl: string): string {
    return currentUrl.split("?")[0];
  }
}

// // Example usage and tests
// if (typeof window === "undefined") {
//   // Node.js environment - run some tests
//   console.log("=== PathUtil Tests ===");

//   const testPath = "/users/123/profile/settings";

//   console.log("Original path:", testPath);
//   console.log("Get segment 1:", PathUtil.getPathSegment(testPath, 1)); // "123"
//   console.log("Get last segment:", PathUtil.getLastSegment(testPath)); // "settings"
//   console.log("Remove segment 1:", PathUtil.removeSegmentByIndex(testPath, 1)); // "/users/profile/settings"
//   console.log(
//     "Remove by value 'profile':",
//     PathUtil.removeSegmentByValue(testPath, "profile")
//   ); // "/users/123/settings"
//   console.log("Remove last segment:", PathUtil.removeLastSegment(testPath)); // "/users/123/profile"
//   console.log(
//     "Add segment at index 2:",
//     PathUtil.addSegmentAtIndex(testPath, 2, "edit")
//   ); // "/users/123/edit/profile/settings"
//   console.log(
//     "Replace segment 2:",
//     PathUtil.replaceSegmentAtIndex(testPath, 2, "dashboard")
//   ); // "/users/123/dashboard/settings"
//   console.log("All segments:", PathUtil.getAllSegments(testPath)); // ["users", "123", "profile", "settings"]
//   console.log("Segment count:", PathUtil.getSegmentCount(testPath)); // 4
//   console.log("Has 'profile':", PathUtil.hasSegment(testPath, "profile")); // true

//   console.log("\n=== Query Parameter Tests ===");

//   // Test query parameter methods
//   const queryParams = {
//     page: 1,
//     limit: 10,
//     sort: "name",
//     tags: ["javascript", "react"],
//   };
//   const urlWithQuery = PathUtil.buildUrlWithQuery("/api/users", queryParams);
//   console.log("URL with query:", urlWithQuery); // "/api/users?page=1&limit=10&sort=name&tags=javascript&tags=react"

//   const existingUrl = "/search?q=test&page=2";
//   const updatedUrl = PathUtil.addQueryParams(existingUrl, {
//     limit: 20,
//     sort: "date",
//   });
//   console.log("Added params:", updatedUrl); // "/search?limit=20&sort=date&q=test&page=2"

//   const updatedUrl2 = PathUtil.updateQueryParams(existingUrl, {
//     page: 5,
//     category: "books",
//   });
//   console.log("Updated params:", updatedUrl2); // "/search?q=test&page=5&category=books"

//   const removedUrl = PathUtil.removeQueryParams(updatedUrl2, ["page"]);
//   console.log("Removed params:", removedUrl); // "/search?q=test&category=books"

//   const pageParam = PathUtil.getQueryParam(existingUrl, "page");
//   console.log("Get 'page' param:", pageParam); // "2"

//   const hasQ = PathUtil.hasQueryParam(existingUrl, "q");
//   console.log("Has 'q' param:", hasQ); // true

//   const clearedUrl = PathUtil.clearQueryParams(existingUrl);
//   console.log("Cleared params:", clearedUrl); // "/search"
// }

export class DetailedError extends Error {
  constructor(public details: string) {
    super(details);
  }
}

export function generateQueryParams(
  params: Record<string, string | number | boolean | null | undefined> = {}
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export function replaceCharacters(
  findChars: string[],
  replaceChars: string[],
  inputString: string
): string {
  // Validate input arrays have the same length
  if (findChars.length !== replaceChars.length) {
    throw new Error(
      "findChars and replaceChars arrays must have the same length"
    );
  }

  // Create a mapping object
  const charMap: Record<string, string> = {};

  // Build the character mapping
  findChars.forEach((char, index) => {
    charMap[char] = replaceChars[index];
  });

  // Use regex for more efficient replacement (especially for longer strings)
  const regex = new RegExp(
    `[${findChars
      .map(
        (char) => char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // Escape regex special characters
      )
      .join("")}]`,
    "g"
  );

  return inputString.replace(regex, (match) => charMap[match] || match);
}

/**
 * Converts various date string formats to a human-readable format
 * @param dateString - The date string to convert
 * @param options - Optional formatting options
 * @returns Formatted date string or error message
 */
export const formatDateString = (
  dateString: string,
  options: {
    includeTime?: boolean;
    dateStyle?: "full" | "long" | "medium" | "short";
    timeStyle?: "full" | "long" | "medium" | "short";
    locale?: string;
    useProximity?: boolean;
  } = {}
): string => {
  const {
    includeTime = false,
    dateStyle = "long",
    timeStyle = "short",
    locale = "en-US",
    useProximity = false,
  } = options;

  try {
    // Handle empty or invalid input
    if (!dateString || typeof dateString !== "string") {
      return "Invalid date input";
    }

    // Clean the input string
    const cleanedInput = dateString.trim();

    // Try to parse the date
    let date: Date;

    // Handle Unix timestamps (seconds or milliseconds)
    const numericValue = Number(cleanedInput);
    if (!isNaN(numericValue) && cleanedInput.match(/^\d+$/)) {
      // If it's likely a Unix timestamp in seconds (10 digits), convert to milliseconds
      const timestamp =
        numericValue < 10000000000 ? numericValue * 1000 : numericValue;
      date = new Date(timestamp);
    } else {
      // Try parsing as a regular date string
      date = new Date(cleanedInput);
    }

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Unable to parse date format";
    }

    // Handle proximity formatting if requested
    if (useProximity) {
      const now = new Date();
      const diffInMs = date.getTime() - now.getTime();
      // const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
      const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));

      // Check if it's today
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dateDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const dayDiff = Math.round(
        (dateDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Handle same day scenarios
      if (dayDiff === 0) {
        if (includeTime) {
          const timeStr = new Intl.DateTimeFormat(locale, {
            timeStyle: timeStyle,
          }).format(date);
          if (Math.abs(diffInHours) <= 3) {
            if (diffInHours >= 0)
              return `in ${Math.round(diffInHours)} hour${Math.round(diffInHours) !== 1 ? "s" : ""}`;
            return `${Math.abs(Math.round(diffInHours))} hour${Math.abs(Math.round(diffInHours)) !== 1 ? "s" : ""} ago`;
          }
          return `today at ${timeStr}`;
        }
        return "today";
      }

      // Handle yesterday and tomorrow
      if (dayDiff === -1) {
        if (includeTime) {
          const timeStr = new Intl.DateTimeFormat(locale, {
            timeStyle: timeStyle,
          }).format(date);
          // Special case for "last night"
          const hour = date.getHours();
          if (hour >= 18 || hour <= 5) {
            return `last night at ${timeStr}`;
          }
          return `yesterday at ${timeStr}`;
        }
        return "yesterday";
      }

      if (dayDiff === 1) {
        if (includeTime) {
          const timeStr = new Intl.DateTimeFormat(locale, {
            timeStyle: timeStyle,
          }).format(date);
          return `tomorrow at ${timeStr}`;
        }
        return "tomorrow";
      }

      // Handle other proximity cases (within a reasonable range)
      if (Math.abs(dayDiff) <= 7) {
        if (dayDiff < -1) {
          return `${Math.abs(dayDiff)} days ago`;
        } else if (dayDiff > 1) {
          return `in ${dayDiff} days`;
        }
      }
    }

    // Format the date using Intl.DateTimeFormat for proper localization
    const formatOptions: Intl.DateTimeFormatOptions = {
      dateStyle: dateStyle,
      ...(includeTime && { timeStyle: timeStyle }),
    };

    return new Intl.DateTimeFormat(locale, formatOptions).format(date);
  } catch (error) {
    return `Error formatting date: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};
