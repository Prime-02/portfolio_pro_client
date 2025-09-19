import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from "axios";
import {
  convertNumericStrings,
  isNumericString,
  removeEmptyStringValues,
} from "../../syncFunctions/syncs";
import { toast } from "@/app/components/toastify/Toastify";

// Define a more specific type for form data values
export type FormDataValue = string | number | boolean | File | Blob;

// Enhanced interface with better type constraints
export interface PostAllDataParams<T = Record<string, unknown>> {
  access?: string;
  data?: T | null;
  url: string;
  useFormData?: boolean;
  message?: string;
  intToString?: boolean;
}

// Helper type to ensure data is serializable
// type SerializableData = Record<
//   string,
//   FormDataValue | FormDataValue[] | Record<string, unknown>
// >;

// Enhanced type guard that handles nested objects and arrays
// function isSerializableData(data: unknown): data is SerializableData {
//   if (typeof data !== "object" || data === null) {
//     return false;
//   }

//   return Object.values(data).every((value) => {
//     if (Array.isArray(value)) {
//       return value.every(
//         (item) =>
//           typeof item === "string" ||
//           typeof item === "number" ||
//           typeof item === "boolean" ||
//           item instanceof File ||
//           item instanceof Blob
//       );
//     }

//     // Allow nested objects (they'll be stringified)
//     if (
//       typeof value === "object" &&
//       value !== null &&
//       !(value instanceof File) &&
//       !(value instanceof Blob)
//     ) {
//       return true; // We'll stringify this
//     }

//     return (
//       typeof value === "string" ||
//       typeof value === "number" ||
//       typeof value === "boolean" ||
//       value instanceof File ||
//       value instanceof Blob
//     );
//   });
// }

export const PostAllData = async <
  T extends Record<string, unknown>,
  R = unknown,
>({
  access,
  data,
  url,
  useFormData = false,
  intToString = true,
}: PostAllDataParams<T>): Promise<R> => {
  try {
    let requestData: T | FormData | undefined = data
      ? intToString
        ? (convertNumericStrings(removeEmptyStringValues(data)) as T)
        : (removeEmptyStringValues(data) as T)
      : undefined;

    const headers: Record<string, string> = {
      ...(access && {
        Authorization: `Bearer ${access}`,
        "ngrok-skip-browser-warning": "true",
      }),
    };

    if (useFormData && data) {
      // Skip the type guard check - just build FormData directly
      const formData = new FormData();
      const cleanedData = removeEmptyStringValues(data);

      console.log("Building FormData from:", cleanedData);

      Object.entries(cleanedData).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          return; // Skip null/undefined values
        }

        console.log(`Processing ${key}:`, typeof value, value);

        // Handle arrays
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return; // Skip empty arrays
          }

          // Check if it's a File array
          if (value.every((item) => item instanceof File)) {
            console.log(`Appending ${value.length} files for ${key}`);
            value.forEach((file) => {
              formData.append(key, file);
            });
          } else {
            // For other arrays (strings, numbers, etc.), stringify
            console.log(`Stringifying array for ${key}:`, value);
            formData.append(key, JSON.stringify(value));
          }
          return;
        }

        // Handle objects (but not Files or Blobs)
        if (
          typeof value === "object" &&
          !(value instanceof File) &&
          !(value instanceof Blob)
        ) {
          console.log(`Stringifying object for ${key}:`, value);
          formData.append(key, JSON.stringify(value));
          return;
        }

        // Handle primitives and Files/Blobs
        if (typeof value === "boolean") {
          formData.append(key, value.toString());
        } else if (typeof value === "number") {
          formData.append(key, value.toString());
        } else if (typeof value === "string") {
          // Convert numeric strings if needed
          if (intToString && isNumericString(value)) {
            formData.append(key, parseInt(value, 10).toString());
          } else {
            formData.append(key, value);
          }
        } else if (value instanceof File || value instanceof Blob) {
          formData.append(key, value);
        } else {
          // Fallback: convert to string
          console.log(`Fallback string conversion for ${key}:`, value);
          formData.append(key, String(value));
        }
      });

      requestData = formData;

      // Log FormData contents for debugging
      console.log("FormData entries:");
      for (const [key, value] of formData.entries()) {
        console.log(
          `  ${key}:`,
          value instanceof File ? `File: ${value.name}` : value
        );
      }
    } else {
      // For non-FormData requests, set Content-Type
      headers["Content-Type"] = "application/json";
    }

    console.log("Making request with:", { url, headers: Object.keys(headers) });

    const response: AxiosResponse<R> = await axios.post(url, requestData, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error("Upload failed:", error);

    // Enhanced error handling
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error("Response data:", axiosError.response?.data);
      console.error("Response status:", axiosError.response?.status);
      console.error("Response headers:", axiosError.response?.headers);
    }

    throw error;
  }
};

// Enhanced interface with better type constraints
interface GetAllDataParams<T = Record<string, unknown>> {
  access?: string;
  url: string;
  type?: string;
  data?: T;
}

export const GetAllData = async <T = Record<string, unknown>, R = unknown>({
  access,
  url,
  type,
  data = {} as T,
}: GetAllDataParams<T>): Promise<R> => {
  try {
    let userTimezone = "UTC";
    try {
      userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      console.warn(`Could not detect timezone, defaulting to ${userTimezone}`);
      console.log(e);
    }

    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${access}`,
        "ngrok-skip-browser-warning": "true",
      },
    };

    // Only add params if data is provided and not empty
    if (data && typeof data === "object" && Object.keys(data).length > 0) {
      config.params = data;
    }

    const response: AxiosResponse<R> = await axios.get(url, config);
    return response.data;
  } catch (error) {
    console.log(`Error fetching ${type}:`, error);

    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 429) {
      const banMessage =
        "Your account was banned due to suspected malicious activity";
      // toast.error(banMessage);
      throw new Error(banMessage);
    }

    // Re-throw the error to allow further handling
    throw axiosError;
  }
};

// Enhanced interface with better type constraints
interface UpdateParams<T = Record<string, unknown>> {
  access: string;
  field: T;
  url: string;
  method?: "patch" | "put";
  useFormData?: boolean;
  intToString?: boolean;
  message?: string;
}

export const UpdateAllData = async <
  T extends Record<string, unknown>,
  R = unknown,
>({
  access,
  field,
  url,
  method = "put",
  useFormData = false,
  intToString = true,
  message = "Updated successfully",
}: UpdateParams<T>): Promise<R> => {
  try {
    // Determine the Axios method based on the `method` parameter
    const axiosMethod =
      method.toLowerCase() === "put" ? axios.put : axios.patch;

    let requestData: T | FormData | undefined = field
      ? intToString
        ? (convertNumericStrings(removeEmptyStringValues(field)) as T)
        : (removeEmptyStringValues(field) as T)
      : undefined;

    const headers: Record<string, string> = {
      ...(access && {
        Authorization: `Bearer ${access}`,
        "ngrok-skip-browser-warning": "true",
      }),
    };

    if (useFormData && field) {
      // Skip the type guard check - just build FormData directly
      const formData = new FormData();
      const cleanedData = removeEmptyStringValues(field);

      console.log("Building FormData from:", cleanedData);

      Object.entries(cleanedData).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          return; // Skip null/undefined values
        }

        console.log(`Processing ${key}:`, typeof value, value);

        // Handle arrays
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return; // Skip empty arrays
          }

          // Check if it's a File array
          if (value.every((item) => item instanceof File)) {
            console.log(`Appending ${value.length} files for ${key}`);
            value.forEach((file) => {
              formData.append(key, file);
            });
          } else {
            // For other arrays (strings, numbers, etc.), stringify
            console.log(`Stringifying array for ${key}:`, value);
            formData.append(key, JSON.stringify(value));
          }
          return;
        }

        // Handle objects (but not Files or Blobs)
        if (
          typeof value === "object" &&
          !(value instanceof File) &&
          !(value instanceof Blob)
        ) {
          console.log(`Stringifying object for ${key}:`, value);
          formData.append(key, JSON.stringify(value));
          return;
        }

        // Handle primitives and Files/Blobs
        if (typeof value === "boolean") {
          formData.append(key, value.toString());
        } else if (typeof value === "number") {
          formData.append(key, value.toString());
        } else if (typeof value === "string") {
          // Convert numeric strings if needed
          if (intToString && isNumericString(value)) {
            formData.append(key, parseInt(value, 10).toString());
          } else {
            formData.append(key, value);
          }
        } else if (value instanceof File || value instanceof Blob) {
          formData.append(key, value);
        } else {
          // Fallback: convert to string
          console.log(`Fallback string conversion for ${key}:`, value);
          formData.append(key, String(value));
        }
      });

      requestData = formData;

      // Log FormData contents for debugging
      console.log("FormData entries:");
      for (const [key, value] of formData.entries()) {
        console.log(
          `  ${key}:`,
          value instanceof File ? `File: ${value.name}` : value
        );
      }
    } else {
      // For non-FormData requests, set Content-Type
      headers["Content-Type"] = "application/json";
    }

    console.log("Making request with:", { url, headers: Object.keys(headers) });

    // Make the request
    const response: AxiosResponse<R> = await axiosMethod(url, requestData, {
      headers,
    });

    // Show success toast
    if (message !== "custom") {
      // toast.success(message);
    }

    return response.data;
  } catch (error) {
    console.error("Update failed:", error);

    // Enhanced error handling
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error("Response data:", axiosError.response?.data);
      console.error("Response status:", axiosError.response?.status);
      console.error("Response headers:", axiosError.response?.headers);
    }

    const errorMessage = handleAxiosError(error as AxiosError);
    toast.error(errorMessage);
    throw error;
  }
};

// Enhanced interface with better type constraints
interface DeleteParams<T = Record<string, unknown>> {
  url: string;
  access: string;
  message?: string;
  data?: T;
}

export const DeleteData = async <T = Record<string, unknown>, R = unknown>({
  url,
  access,
  message = "Deleted",
  data,
}: DeleteParams<T>): Promise<R> => {
  try {
    const response: AxiosResponse<R> = await axios.delete(url, {
      data, // Request payload
      headers: {
        Authorization: `Bearer ${access}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (message !== "custom") {
      // toast.success(message);
    }
    return response.data;
  } catch (error) {
    const errorMessage = handleAxiosError(error as AxiosError);
    toast.error(errorMessage);
    console.error("Delete failed:", error);
    throw error;
  }
};

// Helper function to handle axios errors consistently
function handleAxiosError(axiosError: AxiosError): string {
  let errorMessage =
    "An error occurred. Please contact our support if this problem persists.";

  if (axiosError.response) {
    const responseData = axiosError.response.data;

    if (typeof responseData === "string") {
      errorMessage = responseData;
    } else if (Array.isArray(responseData)) {
      // Handle array of strings or array of objects
      errorMessage = responseData
        .map((item) =>
          typeof item === "object" && item !== null
            ? Object.values(item).join(" ")
            : String(item)
        )
        .join(", ");
    } else if (typeof responseData === "object" && responseData !== null) {
      // Flatten nested error objects
      const messages: string[] = [];
      const collectMessages = (obj: Record<string, unknown>) => {
        Object.values(obj).forEach((value) => {
          if (typeof value === "string") {
            messages.push(value);
          } else if (Array.isArray(value)) {
            messages.push(
              ...value.filter((i): i is string => typeof i === "string")
            );
          } else if (typeof value === "object" && value !== null) {
            collectMessages(value as Record<string, unknown>);
          }
        });
      };
      collectMessages(responseData as Record<string, unknown>);
      errorMessage = messages.length
        ? messages.join(", ")
        : JSON.stringify(responseData);
    }
  } else if (axiosError.request) {
    errorMessage = "No response received from server";
  } else {
    errorMessage = axiosError.message || errorMessage;
  }

  return errorMessage;
}

// Type definitions for better API responses
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Enhanced wrapper with better error handling
export const createApiClient = (
  baseURL: string,
  defaultHeaders: Record<string, string> = {}
) => {
  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      ...defaultHeaders,
    },
  });

  // Request interceptor for consistent header management
  client.interceptors.request.use(
    (config) => {
      // Add any additional request processing here
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for consistent error handling
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Handle common error scenarios
      if (error.response?.status === 401) {
        // Handle unauthorized access
        console.warn("Unauthorized access - consider redirecting to login");
      }

      return Promise.reject(error);
    }
  );

  return client;
};
