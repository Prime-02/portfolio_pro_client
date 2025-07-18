import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from "axios";
import {
  convertNumericStrings,
  isNumericString,
  removeEmptyStringValues,
} from "../../syncFunctions/syncs";
import { toast } from "@/app/components/toastify/Toastify";

// Define a more specific type for form data values
type FormDataValue = string | number | boolean | File | Blob;

// Enhanced interface with better type constraints
export interface PostAllDataParams<T = Record<string, unknown>> {
  access?: string;
  data?: T | null;
  url: string;
  useFormData?: boolean;
  message?: string;
}

// Helper type to ensure data is serializable
type SerializableData = Record<string, FormDataValue | FormDataValue[]>;

// Type guard for checking if data is serializable
function isSerializableData(data: unknown): data is SerializableData {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  return Object.values(data).every((value) => {
    if (Array.isArray(value)) {
      return value.every(
        (item) =>
          typeof item === "string" ||
          typeof item === "number" ||
          typeof item === "boolean" ||
          item instanceof File ||
          item instanceof Blob
      );
    }
    return (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value instanceof File ||
      value instanceof Blob
    );
  });
}

export const PostAllData = async <
  T extends Record<string, unknown>,
  R = unknown,
>({
  access,
  data,
  url,
  useFormData = false,
}: PostAllDataParams<T>): Promise<R> => {
  try {
    let requestData: T | FormData | undefined = data
      ? (convertNumericStrings(removeEmptyStringValues(data)) as T)
      : undefined;

    const headers: Record<string, string> = {
      ...(access && {
        Authorization: `Bearer ${access}`,
        "ngrok-skip-browser-warning": "true",
      }),
    };

    if (useFormData && data) {
      if (!isSerializableData(data)) {
        throw new Error("Data must be serializable for FormData conversion");
      }

      const formData = new FormData();
      const cleanedData = removeEmptyStringValues(data);

      Object.entries(cleanedData).forEach(([key, value]) => {
        if (value != null) {
          let processedValue: FormDataValue = value as FormDataValue;

          // Convert to number if it's a numeric string
          if (typeof value === "string" && isNumericString(value)) {
            processedValue = parseInt(value, 10);
          }

          // Handle different value types for FormData
          if (typeof processedValue === "boolean") {
            formData.append(key, processedValue.toString());
          } else if (typeof processedValue === "number") {
            formData.append(key, processedValue.toString());
          } else {
            formData.append(key, processedValue as string | File | Blob);
          }
        }
      });

      requestData = formData;
      delete headers["Content-Type"]; // Let browser set multipart boundary
    }

    console.log("Post Data", requestData);

    const response: AxiosResponse<R> = await axios.post(url, requestData, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};

// Enhanced interface with better type constraints
interface GetAllDataParams<T = Record<string, unknown>> {
  access: string;
  url: string;
  type: string;
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
  message = "Updated successfully",
}: UpdateParams<T>): Promise<R> => {
  try {
    // Determine the Axios method based on the `method` parameter
    const axiosMethod =
      method.toLowerCase() === "put" ? axios.put : axios.patch;

    // Prepare the request data and headers
    let requestData: T | FormData | undefined = field
      ? (convertNumericStrings(removeEmptyStringValues(field)) as T)
      : undefined;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${access}`,
      "ngrok-skip-browser-warning": "true",
    };

    if (useFormData) {
      if (!isSerializableData(field)) {
        throw new Error(
          "Field data must be serializable for FormData conversion"
        );
      }

      // Convert the field object to FormData
      const formData = new FormData();
      Object.entries(field).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === "boolean") {
            formData.append(key, value.toString());
          } else if (typeof value === "number") {
            formData.append(key, value.toString());
          } else {
            formData.append(key, value as string | File | Blob);
          }
        }
      });
      requestData = formData;
      // Remove Content-Type to let browser set multipart boundary
    } else {
      // Default to application/json
      requestData = field;
      headers["Content-Type"] = "application/json";
    }

    // Make the request
    const config: AxiosRequestConfig = { headers };
    const response: AxiosResponse<R> = await axiosMethod(
      url,
      requestData,
      config
    );

    // Show success toast
    if (message !== "custom") {
      // toast.success(message);
    }
    return response.data;
  } catch (error) {
    const errorMessage = handleAxiosError(error as AxiosError);
    toast.error(errorMessage);
    console.error("Update failed:", error);
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

export const Delete = async <T = Record<string, unknown>, R = unknown>({
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
