import React, { useState, useRef, useEffect } from "react";
import Button from "../buttons/Buttons";

const ImageUploader = ({
  image,
  setImage,
  extension,
  setExtension = () => {},
  maxWidth = 500,
  maxHeight = 500,
  minWidth = 0,
  minHeight = 0,
  maxFileSize = 2 * 1024 * 1024,
  onDelete = () => {},
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Helper function to get image dimensions
  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height,
          });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    // Handle initial image value (could be File, string URL, or null)
    if (typeof image === "string") {
      // It's a URL string, use it directly for preview
      setPreviewUrl(image);
    } else if (image instanceof File) {
      // It's a File object, create object URL for preview
      setPreviewUrl(URL.createObjectURL(image));
    } else {
      // Reset to empty state
      setPreviewUrl(null);
    }

    // Cleanup object URLs when component unmounts or image changes
    return () => {
      if (previewUrl && typeof image === "object") {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [image]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset error state
    setError(null);

    // Check file type
    if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
      setError("Please select a PNG or JPEG image");
      return;
    }

    // Extract and set the file extension
    const fileNameParts = file.name.split(".");
    const fileExt = fileNameParts[fileNameParts.length - 1].toLowerCase();
    setExtension(fileExt);

    // Process the image
    await processImage(file);
  };

  const processImage = async (file) => {
    setIsProcessing(true);

    try {
      const processedFile = await resizeAndCompressImage(
        file,
        maxWidth,
        maxHeight,
        minWidth,
        minHeight,
        maxFileSize
      );

      const originalDimensions = await getImageDimensions(file);
      console.log("Original Image:", {
        width: originalDimensions.width,
        height: originalDimensions.height,
        size: formatFileSize(file.size),
      });

      // Log the processed image dimensions and size
      const processedDimensions = await getImageDimensions(processedFile);
      console.log("Processed Image:", {
        width: processedDimensions.width,
        height: processedDimensions.height,
        size: formatFileSize(processedFile.size),
      });

      // Set the image to the processed file
      setImage(processedFile);
      setError(null);
    } catch (err) {
      console.error("Failed to process the image:", err);
      setError("Failed to process the image. Please try another file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resizeAndCompressImage = async (
    file,
    maxWidth,
    maxHeight,
    minWidth,
    minHeight,
    maxFileSize
  ) => {
    // First resize the image
    const resizedBlob = await resizeImage(
      file,
      maxWidth,
      maxHeight,
      minWidth,
      minHeight
    );

    // Then compress if needed
    if (resizedBlob.size > maxFileSize) {
      const compressedBlob = await compressImage(resizedBlob, maxFileSize);
      // Create a new File object from the compressed blob
      return new File([compressedBlob], file.name, { type: file.type });
    }

    // Create a new File object from the resized blob
    return new File([resizedBlob], file.name, { type: file.type });
  };

 const resizeImage = (file, maxWidth, maxHeight, minWidth, minHeight) => {
   return new Promise((resolve, reject) => {
     const reader = new FileReader();
     reader.onload = (event) => {
       const img = new Image();
       img.onload = () => {
         const canvas = document.createElement("canvas");
         const ctx = canvas.getContext("2d");

         // Start with original dimensions
         let width = img.width;
         let height = img.height;

         // Calculate aspect ratio
         const aspectRatio = width / height;

         // First, ensure the image meets minimum dimensions
         if (minWidth && width < minWidth) {
           width = minWidth;
           height = width / aspectRatio;
         }
         if (minHeight && height < minHeight) {
           height = minHeight;
           width = height * aspectRatio;
         }

         // Then, ensure the image doesn't exceed maximum dimensions
         if (maxWidth && width > maxWidth) {
           width = maxWidth;
           height = width / aspectRatio;
         }
         if (maxHeight && height > maxHeight) {
           height = maxHeight;
           width = height * aspectRatio;
         }

         // If after these adjustments we're still below min dimensions,
         // we need to stretch the image (this will distort aspect ratio)
         if (minWidth && width < minWidth) {
           width = minWidth;
         }
         if (minHeight && height < minHeight) {
           height = minHeight;
         }

         // Final check to ensure we're within bounds
         width = Math.max(minWidth || 0, Math.min(width, maxWidth || Infinity));
         height = Math.max(
           minHeight || 0,
           Math.min(height, maxHeight || Infinity)
         );

         canvas.width = width;
         canvas.height = height;

         // Draw image to canvas
         ctx.drawImage(img, 0, 0, width, height);

         canvas.toBlob(
           (blob) => {
             if (!blob) {
               reject(new Error("Failed to resize image."));
               return;
             }
             resolve(blob);
           },
           file.type,
           0.9
         );
       };
       img.onerror = () => reject(new Error("Failed to load image."));
       img.src = event.target.result;
     };
     reader.onerror = () => reject(new Error("Failed to read file."));
     reader.readAsDataURL(file);
   });
 };
  const compressImage = (blob, maxSize) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        let quality = 0.9;

        const compress = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to compress image."));
                return;
              }

              if (blob.size <= maxSize || quality <= 0.3) {
                // Stop at quality 0.3 to prevent extreme degradation
                resolve(blob);
              } else {
                quality -= 0.1;
                compress();
              }
            },
            blob.type,
            quality
          );
        };

        compress();
      };
      img.onerror = () => reject(new Error("Failed to load image."));
      img.src = URL.createObjectURL(blob);
    });
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processImage(files[0]);
    }
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleClearImage = () => {
    setImage(null);
    setExtension(null); // Also clear the extension when clearing the image
    if (previewUrl && typeof image === "object") {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-md mx-auto card rounded-xl shadow-md">
      {!image ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleTriggerFileInput}
        >
          <input
            type="file"
            accept=".png, .jpg, .jpeg"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <svg
              className={`w-12 h-12 ${
                isDragging ? "text-blue-500" : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
            <p className="text-sm text-gray-600 font-medium">
              Drag and drop an image here, or click to select
            </p>
            <p className="text-xs text-gray-500">PNG, JPG or JPEG {`(max ${maxFileSize / 1024 / 1024}mb)`}</p>
            {(minWidth > 0 || minHeight > 0) && (
              <p className="text-xs text-gray-500">
                Minimum size: {minWidth > 0 ? `${minWidth}px wide` : ""}{" "}
                {minWidth > 0 && minHeight > 0 ? "by" : ""}{" "}
                {minHeight > 0 ? `${minHeight}px tall` : ""}
              </p>
            )}
          </div>

          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-lg">
              <div className="loader w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-auto object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                text="Change"
                onClick={handleTriggerFileInput}
                className="mx-2 px-3 py-2 bg-white text-gray-800 text-sm font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              />
              <Button
                onClick={() => {
                  handleClearImage();
                  onDelete();
                }}
                text="Remove"
                className="mx-2 px-3 py-2 bg-white text-red-600 text-sm font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              />
            </div>
          </div>
          <input
            type="file"
            accept=".png, .jpg, .jpeg"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
        </div>
      )}

      {error && (
        <div className="mt-3 text-red-600 text-sm font-medium">{error}</div>
      )}
    </div>
  );
};

export default ImageUploader;
