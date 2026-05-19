import { Image as LucideImage, X, FileText } from "lucide-react";
import { useState, useEffect, ChangeEvent, DragEvent, useRef } from "react";

// 1. First, define the allowed content types
const ALLOWED_CONTENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
] as const;

// 2. Then derive the type from it
type AllowedContentType = (typeof ALLOWED_CONTENT_TYPES)[number];

// 3. Now you can use AllowedContentType in this mapping
const CONTENT_TYPE_TO_EXTENSION: Record<AllowedContentType, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/gif": "GIF",
  "image/webp": "WebP",
  "image/svg+xml": "SVG",
};

// 4. Generate the string for error messages/hints
const ALLOWED_TYPES_STRING = ALLOWED_CONTENT_TYPES.map(
  (type) => CONTENT_TYPE_TO_EXTENSION[type]
).join(", ");

// 5. Map extensions to content types for URL validation
const EXTENSION_TO_TYPE: Record<string, AllowedContentType> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
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
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragCounter = useRef<number>(0);

  const hasImagePreview = preview && fileType === "image" && !error && !isLoading;
  const hasPdfSelected = fileType === "application" && fileName.toLowerCase().endsWith(".pdf") && !error && !isLoading;

  // Helper function to extract filename from URL
  const getFileNameFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const name = pathname.split("/").pop()?.split("?")[0];
      if (name && name.includes(".")) {
        return decodeURIComponent(name);
      }
      return `file-from-${urlObj.hostname}`;
    } catch {
      return "remote-file";
    }
  };

  const isAllowedUrl = (url: string): boolean => {
    try {
      const urlPath = url.split("?")[0];
      const extension = urlPath.split(".").pop()?.toLowerCase();
      return extension
        ? Object.prototype.hasOwnProperty.call(EXTENSION_TO_TYPE, extension)
        : false;
    } catch {
      return false;
    }
  };

  const getContentTypeFromExtension = (
    extension: string
  ): AllowedContentType | null => {
    return EXTENSION_TO_TYPE[extension.toLowerCase()] || null;
  };

  const getFileTypeCategory = (contentType: string): FileType => {
    return contentType.startsWith("image/") ? "image" : "application";
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    if (!ALLOWED_CONTENT_TYPES.includes(file.type as AllowedContentType)) {
      setError(`File type not allowed. Allowed types: ${ALLOWED_TYPES_STRING}`);
      return;
    }

    setError(null);
    onChange(file);
  };

  const handleClear = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    onChange(null);
  };

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
      try {
        setIsLoading(true);
        new URL(value);

        if (!isAllowedUrl(value)) {
          throw new Error("URL doesn't point to an allowed file type");
        }

        const extractedName = getFileNameFromUrl(value);
        const urlPath = value.split("?")[0];
        const extension = urlPath.split(".").pop()?.toLowerCase();

        if (!extension) throw new Error("Unable to determine file extension from URL");

        const contentType = getContentTypeFromExtension(extension);
        if (!contentType) throw new Error("File type not supported");

        setFileName(extractedName);
        setFileType(getFileTypeCategory(contentType));

        if (contentType.startsWith("image/")) {
          setPreview(value);
          const img = new Image();
          img.onload = () => { setError(null); setIsLoading(false); };
          img.onerror = () => { setError("Unable to load image from URL"); setIsLoading(false); };
          img.src = value;
        } else if (contentType === "application/pdf") {
          setPreview(value);
          fetch(value, { method: "HEAD", mode: "no-cors" })
            .then(() => setIsLoading(false))
            .catch(() => setIsLoading(false));
        } else {
          setPreview(null);
          setDownloadUrl(value);
          setIsLoading(false);
        }
      } catch (err) {
        setPreview(null);
        setFileName("");
        setFileType(null);
        setError(
          err instanceof Error ? err.message : "Invalid URL format or file type not allowed"
        );
        setIsLoading(false);
      }
    } else if (value instanceof File) {
      if (!ALLOWED_CONTENT_TYPES.includes(value.type as AllowedContentType)) {
        setPreview(null);
        setFileName("");
        setFileType(null);
        setError(`File type not allowed. Allowed types: ${ALLOWED_TYPES_STRING}`);
        return;
      }

      setIsLoading(true);
      setFileName(value.name);
      setFileType(getFileTypeCategory(value.type));

      const objectUrl = URL.createObjectURL(value);
      setDownloadUrl(objectUrl);

      if (value.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") setPreview(reader.result);
          setIsLoading(false);
        };
        reader.onerror = () => { setError("Failed to read image file"); setIsLoading(false); };
        reader.readAsDataURL(value);
      } else if (value.type === "application/pdf") {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") setPreview(reader.result);
          setIsLoading(false);
        };
        reader.onerror = () => { setError("Failed to read PDF file"); setIsLoading(false); };
        reader.readAsDataURL(value);
      } else {
        setIsLoading(false);
      }

      return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
    } else {
      setPreview(null);
      setFileName("");
      setFileType(null);
    }
  }, [value]);

  useEffect(() => {
    return () => {
      if (downloadUrl && downloadUrl.startsWith("blob:")) URL.revokeObjectURL(downloadUrl);
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

    if (!ALLOWED_CONTENT_TYPES.includes(file.type as AllowedContentType)) {
      setError(`File type not allowed. Allowed types: ${ALLOWED_CONTENT_TYPES.join(", ")}`);
      return;
    }

    setError(null);
    onChange(file);
  };

  return (
    <div className="flex flex-col gap-2">
      {!disabled && (
        <label className="block text-sm font-medium w-full" htmlFor="file_input" />
      )}

      <input
        id="file_input"
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept={ALLOWED_CONTENT_TYPES.join(",")}
      />

      {!disabled && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative w-full rounded-lg border-2 border-dashed transition-all duration-200 overflow-hidden
            ${isDragging
              ? "border-[var(--accent)] scale-[1.02]"
              : hasImagePreview || hasPdfSelected
                ? "border-[var(--accent)]"
                : "border-gray-300 dark:border-gray-600 hover:border-[var(--accent)] hover:bg-[var(--background)]"
            }`}
          style={
            hasImagePreview
              ? {
                backgroundImage: `url(${preview})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
              : undefined
          }
        >
          {/* Dark overlay when image is loaded, stronger on drag */}
          {hasImagePreview && (
            <div
              className={`absolute inset-0 transition-all duration-200 ${isDragging ? "bg-black/60" : "bg-black/35"
                }`}
            />
          )}

          {/* PDF state background tint */}
          {hasPdfSelected && !hasImagePreview && (
            <div className="absolute inset-0 bg-[var(--accent)]/5" />
          )}

          {/* Drag overlay highlight */}
          {isDragging && !hasImagePreview && (
            <div className="absolute inset-0 bg-[var(--accent)]/10" />
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="relative z-10 flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-t-transparent border-[var(--accent)] rounded-full animate-spin" />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Loading…</span>
            </div>
          )}

          {/* Main dropzone content */}
          {!isLoading && (
            <label
              htmlFor="file_input"
              className="relative z-10 flex flex-col items-center justify-center gap-2 px-4 py-6 cursor-pointer text-center"
            >
              {hasImagePreview ? (
                /* Image loaded — compact overlay UI */
                <>
                  <LucideImage className="w-6 h-6 text-white/80 drop-shadow" />
                  <span className="text-sm font-medium text-white drop-shadow">
                    {fileName}
                  </span>
                  <span className="text-xs text-white/70 drop-shadow">
                    Click or drop to replace
                  </span>
                </>
              ) : hasPdfSelected ? (
                /* PDF loaded — compact info UI */
                <>
                  <FileText className={`w-8 h-8 transition-colors duration-200 ${isDragging ? "text-[var(--accent)]" : "text-gray-400 dark:text-gray-500"}`} />
                  <span className="text-sm font-medium text-[var(--accent)]">{fileName}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Click or drop to replace</span>
                </>
              ) : (
                /* Empty state */
                <>
                  <LucideImage className={`w-8 h-8 transition-colors duration-200 ${isDragging ? "text-[var(--accent)]" : "text-gray-400 dark:text-gray-500"}`} />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-[var(--accent)]">
                      {isDragging ? "Drop file here" : "Choose File"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      or drag and drop
                    </span>
                  </div>
                </>
              )}
            </label>
          )}

          {/* Clear button — shown when a file is selected */}
          {(hasImagePreview || hasPdfSelected) && !disabled && (
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 z-20 p-1 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors duration-150"
              aria-label="Remove file"
              type="button"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Disabled view — image as background in read-only zone */}
      {disabled && hasImagePreview && (
        <div
          className="relative w-full rounded-lg overflow-hidden"
          style={{
            backgroundImage: `url(${preview})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "160px",
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 flex items-end p-3">
            <span className="text-xs text-white/80 drop-shadow">{fileName}</span>
          </div>
        </div>
      )}

      {/* Disabled view — PDF */}
      {disabled && hasPdfSelected && preview && (
        <div className="border rounded-lg p-4 bg-[var(--background)]">
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

      {!disabled && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Allowed file types: {ALLOWED_TYPES_STRING}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}

      {/* Fallback download link for non-preview files */}
      {fileName && !preview && !textContent && !error && !isLoading && downloadUrl && (
        <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <p className="text-sm font-medium">{fileName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {fileType === "application" ? "PDF Document" : fileType === "image" ? "Image file" : "File"}
          </p>
          <a
            href={downloadUrl}
            download={fileName}
            className="inline-block px-3 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600"
          >
            Download/Open
          </a>
        </div>
      )}
    </div>
  );
};