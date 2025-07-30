import { Image as LucideImage } from "lucide-react";
import { useState, useEffect, ChangeEvent } from "react";

// Define allowed content types - only PDF and images
const ALLOWED_CONTENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

type AllowedContentType = (typeof ALLOWED_CONTENT_TYPES)[number];

// Map extensions to content types for URL validation
const EXTENSION_TO_TYPE: Record<string, AllowedContentType> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

type FileType = "image" | "application";

interface FileInputProps {
  value: File | string | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export const FileInput: React.FC<FileInputProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileType, setFileType] = useState<FileType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Helper function to extract filename from URL
  const getFileNameFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      // Get last part of path and remove query parameters
      const name = pathname.split("/").pop()?.split("?")[0];
      // Check if the name contains a file extension
      if (name && name.includes(".")) {
        return decodeURIComponent(name); // Handle URL encoded characters
      }
      // If no proper filename found in the path, create one based on the hostname
      return `file-from-${urlObj.hostname}`;
    } catch {
      return "remote-file";
    }
  };

  // Helper function to determine if URL has allowed file type
  const isAllowedUrl = (url: string): boolean => {
    try {
      const urlPath = url.split("?")[0]; // Remove query params
      const extension = urlPath.split(".").pop()?.toLowerCase();
      return extension
        ? Object.prototype.hasOwnProperty.call(EXTENSION_TO_TYPE, extension)
        : false;
    } catch {
      return false;
    }
  };

  // Helper function to get content type from extension
  const getContentTypeFromExtension = (
    extension: string
  ): AllowedContentType | null => {
    return EXTENSION_TO_TYPE[extension.toLowerCase()] || null;
  };

  // Helper function to determine file type category
  const getFileTypeCategory = (contentType: string): FileType => {
    return contentType.startsWith("image/") ? "image" : "application";
  };

  // Effect to handle initial value (URL string or File object)
  useEffect(() => {
    setError(null);
    setIsLoading(false);
    setTextContent(null);
    setDownloadUrl(null);

    if (!value) {
      setPreview(null);
      setFileName("");
      setFileType(null);
      return;
    }

    if (typeof value === "string" && value.trim() !== "") {
      // Handle URL string
      try {
        setIsLoading(true);
        // Validate it's a proper URL
        new URL(value);

        // Check if URL has allowed file type
        if (!isAllowedUrl(value)) {
          throw new Error("URL doesn't point to an allowed file type");
        }

        const extractedName = getFileNameFromUrl(value);
        const urlPath = value.split("?")[0];
        const extension = urlPath.split(".").pop()?.toLowerCase();

        if (!extension) {
          throw new Error("Unable to determine file extension from URL");
        }

        const contentType = getContentTypeFromExtension(extension);

        if (!contentType) {
          throw new Error("File type not supported");
        }

        setFileName(extractedName);
        setFileType(getFileTypeCategory(contentType));

        // For image URLs, we can show preview
        if (contentType.startsWith("image/")) {
          setPreview(value);
          const img = new Image();
          img.onload = () => {
            setError(null);
            setIsLoading(false);
          };
          img.onerror = () => {
            setError("Unable to load image from URL");
            setIsLoading(false);
          };
          img.src = value;
        }
        // For PDFs, we can try to embed
        else if (contentType === "application/pdf") {
          setPreview(value);
          fetch(value, { method: "HEAD", mode: "no-cors" })
            .then(() => setIsLoading(false))
            .catch(() => setIsLoading(false));
        }
        // For other types, no preview but we allow the URL and create download link
        else {
          setPreview(null);
          setDownloadUrl(value);
          setIsLoading(false);
        }
      } catch (err) {
        setPreview(null);
        setFileName("");
        setFileType(null);
        setError(
          err instanceof Error
            ? err.message
            : "Invalid URL format or file type not allowed"
        );
        setIsLoading(false);
      }
    } else if (value instanceof File) {
      // Handle File object
      if (!ALLOWED_CONTENT_TYPES.includes(value.type as AllowedContentType)) {
        setPreview(null);
        setFileName("");
        setFileType(null);
        setError("File type not allowed");
        return;
      }

      setIsLoading(true);
      setFileName(value.name);
      setFileType(getFileTypeCategory(value.type));

      // Create an object URL for all file types for download capability
      const objectUrl = URL.createObjectURL(value);
      setDownloadUrl(objectUrl);

      // Handle different file types for preview
      if (value.type.startsWith("image/")) {
        // For images
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setPreview(reader.result);
          }
          setIsLoading(false);
        };
        reader.onerror = () => {
          setError("Failed to read image file");
          setIsLoading(false);
        };
        reader.readAsDataURL(value);
      } else if (value.type === "application/pdf") {
        // For PDFs
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setPreview(reader.result);
          }
          setIsLoading(false);
        };
        reader.onerror = () => {
          setError("Failed to read PDF file");
          setIsLoading(false);
        };
        reader.readAsDataURL(value);
      } else {
        // For other document types
        setIsLoading(false);
      }

      // Clean up object URL when component unmounts
      return () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
    } else {
      // Handle invalid value
      setPreview(null);
      setFileName("");
      setFileType(null);
    }
  }, [value]);

  // Cleanup function for object URLs
  useEffect(() => {
    return () => {
      if (downloadUrl && downloadUrl.startsWith("blob:")) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setPreview(null);
      setFileName("");
      setFileType(null);
      setTextContent(null);
      setDownloadUrl(null);
      onChange(null);
      return;
    }

    // Validate file type
    if (!ALLOWED_CONTENT_TYPES.includes(file.type as AllowedContentType)) {
      setError(
        `File type not allowed. Allowed types: ${ALLOWED_CONTENT_TYPES.join(", ")}`
      );
      return;
    }

    setError(null);
    // Pass the file object to parent immediately
    onChange(file);

    // The rest of the preview/processing will be handled by the useEffect
  };

  return (
    <div className="flex flex-col gap-2">
      {!disabled && (
        <label
          className="block text-sm font-medium w-full"
          htmlFor="file_input"
        ></label>
      )}
      <input
        id="file_input"
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept={ALLOWED_CONTENT_TYPES.join(",")}
      />

      {!disabled && (
        <label
          htmlFor="file_input"
          className="w-full text-sm text-[var(--accent)]   border border-[var(--accent)]  rounded-lg cursor-pointer transition duration-100 hover:bg-[var(--background)] px-3 py-1.5 text-center  flex items-center gap-x-1"
        >
          <LucideImage className="w-4 h-4" />
          <span>Choose File</span>
        </label>
      )}

      {!disabled && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Allowed file types: PDF, JPG, PNG, GIF, WebP
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}

      {isLoading && (
        <div className="flex items-center justify-center mt-2">
          <div className="w-4 h-4 border-2  border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
            Loading...
          </span>
        </div>
      )}

      {/* Preview for different file types */}
      {fileName && !error && !isLoading && (
        <div className="mt-4">
          {!disabled && (
            <h2 className="text-lg font-semibold mb-2">Preview:</h2>
          )}
          {/* Image preview */}
          {preview && fileType === "image" && (
            <img
              src={preview}
              alt="Preview"
              className="max-w-full h-auto max-h-64 rounded-lg mx-auto"
              onError={() => setError("Failed to load image")}
            />
          )}

          {/* PDF preview */}
          {preview &&
            fileType === "application" &&
            fileName.toLowerCase().endsWith(".pdf") && (
              <div className="border rounded-lg p-4 bg-[var(--background)]  ">
                <embed
                  src={preview}
                  type="application/pdf"
                  width="100%"
                  height="300px"
                  className="rounded-lg"
                  onError={() => setError("Failed to load PDF")}
                />
              </div>
            )}

          {/* Text file content - removed since we only support PDF and images now */}
          {textContent && (
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 overflow-auto max-h-64">
              <pre className="text-sm whitespace-pre-wrap">{textContent}</pre>
            </div>
          )}

          {/* Document info with download link */}
          {fileName && !preview && !textContent && (
            <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-sm font-medium">{fileName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {fileType === "application"
                  ? "PDF Document"
                  : fileType === "image"
                    ? "Image file"
                    : "File"}
              </p>
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={fileName}
                  className="inline-block px-3 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600"
                >
                  Download/Open
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
