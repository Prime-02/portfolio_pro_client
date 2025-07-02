import { Image as LucideImage } from "lucide-react";
import { useState, useEffect } from "react";

// Define allowed content types
const ALLOWED_CONTENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/gif",
];

// Map extensions to content types for URL validation
const EXTENSION_TO_TYPE = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
};

export const FileInput = ({ value, onChange, disabled = false }) => {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [textContent, setTextContent] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  // Helper function to extract filename from URL
  const getFileNameFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      // Get last part of path and remove query parameters
      const name = pathname.split("/").pop().split("?")[0];
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
  const isAllowedUrl = (url) => {
    try {
      const urlPath = url.split("?")[0]; // Remove query params
      const extension = urlPath.split(".").pop().toLowerCase();
      return EXTENSION_TO_TYPE.hasOwnProperty(extension);
    } catch {
      return false;
    }
  };

  // Helper function to get content type from extension
  const getContentTypeFromExtension = (extension) => {
    return EXTENSION_TO_TYPE[extension.toLowerCase()] || null;
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
        const extension = urlPath.split(".").pop().toLowerCase();
        const contentType = getContentTypeFromExtension(extension);

        setFileName(extractedName);
        setFileType(contentType.split("/")[0]); // 'image', 'application', etc.

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
        // For text files, try to fetch and display content
        else if (contentType === "text/plain") {
          fetch(value)
            .then((response) => {
              if (!response.ok) throw new Error("Failed to fetch text file");
              return response.text();
            })
            .then((text) => {
              setTextContent(text);
              setIsLoading(false);
            })
            .catch((err) => {
              setError(err.message);
              setIsLoading(false);
            });
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
        setError(err.message || "Invalid URL format or file type not allowed");
        setIsLoading(false);
      }
    } else if (value instanceof File) {
      // Handle File object
      if (!ALLOWED_CONTENT_TYPES.includes(value.type)) {
        setPreview(null);
        setFileName("");
        setFileType(null);
        setError("File type not allowed");
        return;
      }

      setIsLoading(true);
      setFileName(value.name);
      setFileType(value.type.split("/")[0]);

      // Create an object URL for all file types for download capability
      const objectUrl = URL.createObjectURL(value);
      setDownloadUrl(objectUrl);

      // Handle different file types for preview
      if (value.type.startsWith("image/")) {
        // For images
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
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
          setPreview(reader.result);
          setIsLoading(false);
        };
        reader.onerror = () => {
          setError("Failed to read PDF file");
          setIsLoading(false);
        };
        reader.readAsDataURL(value);
      } else if (value.type === "text/plain") {
        // For text files
        const reader = new FileReader();
        reader.onloadend = () => {
          setTextContent(reader.result);
          setIsLoading(false);
        };
        reader.onerror = () => {
          setError("Failed to read text file");
          setIsLoading(false);
        };
        reader.readAsText(value);
      } else {
        // For other document types (docx, etc.)
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
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
    if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
      setError(
        `File type not allowed. Allowed types: ${ALLOWED_CONTENT_TYPES.join(
          ", "
        )}`
      );
      return;
    }

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
        >
          Upload File
        </label>
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
          className="w-full text-sm text-white bg-blue-500 border border-blue-500 rounded-lg cursor-pointer px-3 py-1.5 text-center hover:bg-blue-600 dark:bg-blue-700 dark:border-blue-700 dark:hover:bg-blue-800 flex items-center gap-x-1"
        >
          <LucideImage className="w-4 h-4" />
          <span>Choose File</span>
        </label>
      )}

      {!disabled && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Allowed file types: PDF, Word, Excel, PowerPoint, JPG, PNG, GIF
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}

      {isLoading && (
        <div className="flex items-center justify-center mt-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
              className="max-w-full h-auto max-h-64 rounded-lg"
              onError={() => setError("Failed to load image")}
            />
          )}

          {/* PDF preview */}
          {preview &&
            fileType === "application" &&
            fileName.endsWith(".pdf") && (
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
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

          {/* Text file content */}
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
                  ? "Document file"
                  : fileType === "text"
                  ? "Text file"
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
