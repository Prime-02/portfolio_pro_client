import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from "axios";
import {
  convertNumericStrings,
  isNumericString,
  removeEmptyStringValues,
} from "../../syncFunctions/syncs";

export interface PostAllDataParams<T = any> {
  access?: string;
  data?: T | null;
  url: string;
  useFormData?: boolean;
  message?: string;
}

export const PostAllData = async <T extends {} = any, R = any>({
  access,
  data,
  url,
  useFormData = false,
}: PostAllDataParams<T>): Promise<R> => {
  try {
    let requestData = data
      ? convertNumericStrings(removeEmptyStringValues(data))
      : undefined;
    const headers: Record<string, string> = {
      ...(access && {
        Authorization: `Bearer ${access}`,
        "ngrok-skip-browser-warning": "true",
      }),
    };

    if (useFormData && data) {
      const formData = new FormData();
      const cleanedData = removeEmptyStringValues(data);
      for (const key in cleanedData) {
        if (Object.prototype.hasOwnProperty.call(cleanedData, key)) {
          let value = cleanedData[key as keyof typeof cleanedData];
          // Convert to number if it's a numeric string
          if (typeof value === "string" && isNumericString(value)) {
            value = parseInt(
              value,
              10
            ) as unknown as NonNullable<T>[keyof NonNullable<T>];
          }
          formData.append(key, value as any);
        }
      }
      requestData = formData;
      delete headers["Content-Type"];
    }

    console.log("Post Data", requestData);

    const response: AxiosResponse<R> = await axios.post(url, requestData, {
      headers,
    });
    return response.data;
  } catch (error) {
    let errorMessage =
      "An error occurred. Please contact our support if this problem persists.";

    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const responseData = axiosError.response.data;

      if (typeof responseData === "string") {
        errorMessage = responseData;
      } else if (Array.isArray(responseData)) {
        errorMessage = responseData
          .map((item) =>
            typeof item === "object" ? Object.values(item).join(" ") : item
          )
          .join(", ");
      } else if (typeof responseData === "object" && responseData !== null) {
        const messages: string[] = [];
        const collectMessages = (obj: object) => {
          Object.values(obj).forEach((value) => {
            if (typeof value === "string") {
              messages.push(value);
            } else if (Array.isArray(value)) {
              messages.push(...value.filter((i) => typeof i === "string"));
            } else if (typeof value === "object" && value !== null) {
              collectMessages(value);
            }
          });
        };
        collectMessages(responseData);
        errorMessage = messages.length
          ? messages.join(", ")
          : JSON.stringify(responseData);
      }
    } else if (axiosError.request) {
      errorMessage = "No response received from server";
    } else {
      errorMessage = axiosError.message || errorMessage;
    }
    console.error("Upload failed:", error);
    throw error;
  }
};

interface GetAllDataParams<T = any> {
  access: string;
  url: string;
  type: string;
  data?: T | object;
}

export const GetAllData = async <T = any, R = any>({
  access,
  url,
  type,
  data = {},
}: GetAllDataParams<T>): Promise<R> => {
  try {
    let userTimezone = "UTC";
    try {
      userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      console.warn("Could not detect timezone, defaulting to UTC");
    }

    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${access}`,
        "ngrok-skip-browser-warning": "true",
      },
    };

    // Only add params if data is provided and not empty
    if (data && Object.keys(data).length > 0) {
      config.params = data;
    }

    const response: AxiosResponse<R> = await axios.get(url, config);
    return response.data;
  } catch (error) {
    console.log(`Error fetching ${type}:`, error);

    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 429) {
      // toast.error("Your account was banned due to suspected malicious activity");
      throw new Error(
        "Your account was banned due to suspected malicious activity"
      );
    }

    // Re-throw the error to allow further handling
    throw axiosError;
  }
};

interface UpdateParams<T = any> {
  access: string;
  field: T;
  url: string;
  method?: "patch" | "put";
  useFormData?: boolean;
  message?: string;
}

export const UpdateAllData = async <T = any, R = any>({
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
    let requestData: T | FormData;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${access}`,
      "ngrok-skip-browser-warning": "true",
    };

    if (useFormData) {
      // If useFormData is true, convert the field object to FormData
      const formData = new FormData();
      for (const key in field) {
        if (Object.prototype.hasOwnProperty.call(field, key)) {
          const value = field[key as keyof T];
          if (value !== undefined && value !== null) {
            formData.append(key, value as any);
          }
        }
      }
      requestData = formData;

      // Set headers for multipart/form-data
      headers["Content-Type"] = "multipart/form-data";
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
    let errorMessage =
      "An error occurred. Please contact our support if this problem persists.";

    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const responseData = axiosError.response.data;

      if (typeof responseData === "string") {
        errorMessage = responseData;
      } else if (Array.isArray(responseData)) {
        // Handle array of strings or array of objects
        errorMessage = responseData
          .map((item) =>
            typeof item === "object" ? Object.values(item).join(" ") : item
          )
          .join(", ");
      } else if (typeof responseData === "object" && responseData !== null) {
        // Flatten nested error objects
        const messages: string[] = [];
        const collectMessages = (obj: object) => {
          Object.values(obj).forEach((value) => {
            if (typeof value === "string") {
              messages.push(value);
            } else if (Array.isArray(value)) {
              messages.push(...value.filter((i) => typeof i === "string"));
            } else if (typeof value === "object" && value !== null) {
              collectMessages(value);
            }
          });
        };
        collectMessages(responseData);
        errorMessage = messages.length
          ? messages.join(", ")
          : JSON.stringify(responseData);
      }
    } else if (axiosError.request) {
      errorMessage = "No response received from server";
    } else {
      errorMessage = axiosError.message || errorMessage;
    }

    // toast.error(errorMessage);
    console.error("Update failed:", error);
    throw error;
  }
};

interface DeleteParams<T = any> {
  url: string;
  access: string;
  message?: string;
  data?: T;
}

export const Delete = async <T = any, R = any>({
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
    let errorMessage =
      "An error occurred. Please contact our support if this problem persists.";

    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const responseData = axiosError.response.data;

      if (typeof responseData === "string") {
        errorMessage = responseData;
      } else if (Array.isArray(responseData)) {
        // Handle array of strings or array of objects
        errorMessage = responseData
          .map((item) =>
            typeof item === "object" ? Object.values(item).join(" ") : item
          )
          .join(", ");
      } else if (typeof responseData === "object" && responseData !== null) {
        // Flatten nested error objects
        const messages: string[] = [];
        const collectMessages = (obj: object) => {
          Object.values(obj).forEach((value) => {
            if (typeof value === "string") {
              messages.push(value);
            } else if (Array.isArray(value)) {
              messages.push(...value.filter((i) => typeof i === "string"));
            } else if (typeof value === "object" && value !== null) {
              collectMessages(value);
            }
          });
        };
        collectMessages(responseData);
        errorMessage = messages.length
          ? messages.join(", ")
          : JSON.stringify(responseData);
      }
    } else if (axiosError.request) {
      errorMessage = "No response received from server";
    } else {
      errorMessage = axiosError.message || errorMessage;
    }

    // toast.error(errorMessage);
    console.error("Delete failed:", error);
    throw error;
  }
};
