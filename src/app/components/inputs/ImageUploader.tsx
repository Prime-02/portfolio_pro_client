import { useCallback, useState, useRef, useEffect } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Upload,
  X,
  RotateCcw,
  Settings,
  Square,
  Maximize,
  Smartphone,
  Monitor,
  Download,
} from "lucide-react";
import { getColorShade } from "../utilities/syncFunctions/syncs";
import { useTheme } from "../theme/ThemeContext ";
import Button from "../buttons/Buttons";
import RangeInput from "./RangeInput";
import { Textinput } from "./Textinput";

interface ImageCropperProps {
  onFinish?: (data: { file: File | null; croppedImage: string | null }) => void;
  onResetImageChange?: () => void;
  loading?: boolean;
  croppedImage?: string | null; // Optional controlled state for final image
  onCroppedImageChange?: (croppedImage: string | null) => void; // Callback for controlled mode
  title?: string;
  description?: string;
}

type ImageFormat = "jpeg" | "png" | "webp";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ImageCropper({
  onFinish,
  loading = false,
  croppedImage: controlledCroppedImage, // Controlled cropped image state
  onCroppedImageChange, // Callback for when cropped image changes
  title = "Upload Image",
  description = "All formats supported, up to 5mb",
  onResetImageChange,
}: ImageCropperProps) {
  const { theme } = useTheme();
  const [image, setImage] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [internalCroppedImage, setInternalCroppedImage] = useState<
    string | null
  >(null);
  const [fileName, setFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState(0.9);
  const [format, setFormat] = useState<ImageFormat>("jpeg");
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [cropAspect, setCropAspect] = useState<number | undefined>(undefined);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false); // Track if finish has been clicked
  const imgRef = useRef<HTMLImageElement>(null);

  const currentImage = image;

  // Determine if component is in controlled mode
  const isControlled = controlledCroppedImage !== undefined;

  // Use controlled or internal cropped image state
  const croppedImage = isControlled
    ? controlledCroppedImage
    : internalCroppedImage;

  // Helper to update cropped image (controlled or internal)
  const updateCroppedImage = (newCroppedImage: string | null) => {
    if (isControlled && onCroppedImageChange) {
      onCroppedImageChange(newCroppedImage);
    } else {
      setInternalCroppedImage(newCroppedImage);
    }
  };

  const aspectRatios = [
    { label: "Free", value: undefined, icon: Maximize },
    { label: "1:1", value: 1, icon: Square },
    { label: "4:3", value: 4 / 3, icon: Monitor },
    { label: "16:9", value: 16 / 9, icon: Monitor },
    { label: "9:16", value: 9 / 16, icon: Smartphone },
    { label: "3:4", value: 3 / 4, icon: Smartphone },
  ];

  // Determine if finish button should be shown (only in uncontrolled mode with onFinish and not finished)
  const shouldShowFinishButton = !isControlled && !!onFinish && !isFinished;

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (image && image.startsWith("blob:")) {
        URL.revokeObjectURL(image);
      }
      if (croppedImage && croppedImage.startsWith("blob:")) {
        URL.revokeObjectURL(croppedImage);
      }
    };
  }, [image, croppedImage]);

  // Effect to handle aspect ratio changes and reset crop
  useEffect(() => {
    if (currentImage && imgRef.current) {
      setQuality(0.9);
      setFormat("jpeg");
      // Reset crop when aspect ratio changes
      setCrop(undefined);
      // Give time for the image to render with new aspect ratio
      setTimeout(() => {
        if (imgRef.current) {
          const newCrop: Crop = {
            unit: "%",
            x: 10,
            y: 10,
            width: 80,
            height: cropAspect ? 80 / cropAspect : 80,
          };
          setCrop(newCrop);
        }
      }, 100);
    }
  }, [cropAspect, currentImage]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setError(null);

      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.file.size > MAX_FILE_SIZE) {
          setError("File size exceeds 5MB limit");
        } else {
          setError("Invalid file type");
        }
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        setFileName(file.name);
        setCurrentFile(file); // Store the file

        const reader = new FileReader();

        reader.onloadstart = () => setIsProcessing(true);
        reader.onerror = () => {
          setError("Failed to read file");
          setIsProcessing(false);
        };

        reader.onload = () => {
          try {
            const imageData = reader.result as string;
            setImage(imageData);
            updateCroppedImage(null);
            setCrop(undefined); // Reset crop
            setRotation(0);
            setBrightness(100);
            setContrast(100);
            setSaturation(100);
            setFlipH(false);
            setFlipV(false);
          } catch (err) {
            setError("Error processing image");
            console.log(err);
          } finally {
            setIsProcessing(false);
          }
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".webp"],
    },
    maxFiles: 1,
    multiple: false,
    maxSize: MAX_FILE_SIZE,
  });

  const applyFilters = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) => {
    if (brightness !== 100 || contrast !== 100 || saturation !== 100) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Brightness
        data[i] = Math.min(255, Math.max(0, data[i] * (brightness / 100)));
        data[i + 1] = Math.min(
          255,
          Math.max(0, data[i + 1] * (brightness / 100))
        );
        data[i + 2] = Math.min(
          255,
          Math.max(0, data[i + 2] * (brightness / 100))
        );

        // Contrast
        data[i] = Math.min(
          255,
          Math.max(0, (data[i] - 128) * (contrast / 100) + 128)
        );
        data[i + 1] = Math.min(
          255,
          Math.max(0, (data[i + 1] - 128) * (contrast / 100) + 128)
        );
        data[i + 2] = Math.min(
          255,
          Math.max(0, (data[i + 2] - 128) * (contrast / 100) + 128)
        );

        // Saturation
        if (saturation !== 100) {
          const gray =
            data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = Math.min(
            255,
            Math.max(0, gray + (data[i] - gray) * (saturation / 100))
          );
          data[i + 1] = Math.min(
            255,
            Math.max(0, gray + (data[i + 1] - gray) * (saturation / 100))
          );
          data[i + 2] = Math.min(
            255,
            Math.max(0, gray + (data[i + 2] - gray) * (saturation / 100))
          );
        }
      }

      ctx.putImageData(imageData, 0, 0);
    }
  };

  const generateCroppedImage = useCallback(() => {
    if (!currentImage || !imgRef.current || !crop?.width || !crop?.height)
      return;

    setIsProcessing(true);

    requestAnimationFrame(() => {
      try {
        const canvas = document.createElement("canvas");
        const img = imgRef.current!;
        const scaleX = img.naturalWidth / img.width;
        const scaleY = img.naturalHeight / img.height;

        const cropWidth = crop.width * scaleX;
        const cropHeight = crop.height * scaleY;

        // Set canvas size
        const MAX_DIMENSION = 4000;
        if (cropWidth > MAX_DIMENSION || cropHeight > MAX_DIMENSION) {
          const scale = Math.min(
            MAX_DIMENSION / cropWidth,
            MAX_DIMENSION / cropHeight
          );
          canvas.width = Math.floor(cropWidth * scale);
          canvas.height = Math.floor(cropHeight * scale);
        } else {
          canvas.width = cropWidth;
          canvas.height = cropHeight;
        }

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.save();

          // Apply all transformations to the canvas
          ctx.translate(canvas.width / 2, canvas.height / 2);

          // Apply rotation
          ctx.rotate((rotation * Math.PI) / 180);

          // Apply flips
          ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

          // Draw the cropped portion of the image
          ctx.drawImage(
            img,
            crop.x * scaleX,
            crop.y * scaleY,
            cropWidth,
            cropHeight,
            -canvas.width / 2,
            -canvas.height / 2,
            canvas.width,
            canvas.height
          );

          ctx.restore();

          // Apply filters (brightness, contrast, saturation)
          applyFilters(canvas, ctx);

          // Reduce quality for large images
          let finalQuality = quality;
          if (canvas.width * canvas.height > 2000 * 2000) {
            finalQuality = Math.max(0.6, quality * 0.9);
          }

          const croppedImageUrl = canvas.toDataURL(
            `image/${format}`,
            finalQuality
          );
          updateCroppedImage(croppedImageUrl);
        }
      } catch (err) {
        setError("Error processing image");
        console.log(err);
      } finally {
        setIsProcessing(false);
      }
    });
  }, [
    currentImage,
    crop,
    rotation,
    flipH,
    flipV,
    quality,
    format,
    brightness,
    contrast,
    saturation,
  ]);

  const onCropComplete = useCallback(
    (crop: Crop) => {
      if (!currentImage || !imgRef.current || !crop.width || !crop.height)
        return;

      // Generate cropped image when crop is complete
      generateCroppedImage();
    },
    [generateCroppedImage, currentImage]
  );

  // Regenerate cropped image when filters change
  useEffect(() => {
    if (crop && currentImage) {
      generateCroppedImage();
    }
  }, [
    rotation,
    flipH,
    flipV,
    brightness,
    contrast,
    saturation,
    quality,
    format,
  ]);

  const downloadImage = () => {
    if (!croppedImage) return;
    try {
      const link = document.createElement("a");
      const baseName = fileName.split(".")[0] || "image";
      link.download = `${baseName}-cropped.${format}`;
      link.href = croppedImage;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError("Failed to download image");
      console.log(err);
    }
  };

  const resetUploader = () => {
    setImage(null);
    setCurrentFile(null);
    updateCroppedImage(null);
    setCrop(undefined);
    setFileName("");
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setFlipH(false);
    setFlipV(false);
    setError(null);
    setIsFinished(false); // Reset the finished state
    if (onResetImageChange) {
      onResetImageChange();
    }
    // Call onFinish with null values only in uncontrolled mode
    if (!isControlled && onFinish) {
      onFinish({
        file: null,
        croppedImage: null,
      });
    }
  };

  const quickRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleAspectRatioChange = (aspectValue: number | undefined) => {
    setCropAspect(aspectValue);
  };

  const getImageStyle = () => {
    return {
      transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
      maxHeight: "200px",
    };
  };

  const handleFinish = () => {
    if (onFinish) {
      onFinish({
        file: currentFile,
        croppedImage: croppedImage,
      });
      setIsFinished(true); // Set finished state to hide the button
    }
  };

  return (
    <div className="card rounded-lg shadow-sm p-4 max-w-md mx-auto">
      <div className="flex items-center justify-end mb-4">
        {currentImage && (
          <span
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg  transition-colors ${
              showSettings
                ? "bg-[var(--accent)] text-[var(--foreground)]"
                : "cursor-pointer"
            }`}
            aria-label={showSettings ? "Hide settings" : "Show settings"}
            // aria-expanded={showSettings}
          >
            <Settings size={16} />
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {!currentImage ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all
            ${
              isDragActive
                ? "border-[var(--accent)] bg-[var(--accent)]"
                : "border-gray-300 hover:border-[var(--accent)]"
            }
          `}
          aria-label="Upload image"
        >
          <input {...getInputProps()} />
          <div className="text-center">
            <div
              className={`
              inline-flex items-center justify-center w-12 h-12 rounded-full mb-2
              ${isDragActive ? "bg-[var(--accent)] text-white" : "border border-[var(--accent)]"}
            `}
            >
              <Upload size={20} />
            </div>
            <p className="text-sm font-medium mb-1">
              {isDragActive ? "Drop here" : title}
            </p>
            <p className="text-xs ">{description}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* File info and quick actions */}
          <div
            className="flex items-center justify-between p-2 rounded"
            style={{
              backgroundColor: getColorShade(theme.background, 10),
            }}
          >
            <span className="text-sm truncate flex-1" title={fileName}>
              {fileName || "Image"}
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={quickRotate}
                className="p-1 hover: rounded"
                title="Rotate 90°"
                aria-label="Rotate image 90 degrees"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={resetUploader}
                className="p-1 hover: rounded"
                title="Remove"
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className=" p-3 rounded-lg space-y-3">
              {/* Aspect Ratio */}
              <div>
                <label className="text-xs font-medium mb-1 block">
                  Aspect Ratio
                </label>
                <div className="flex flex-wrap gap-1">
                  {aspectRatios.map((ratio) => (
                    <button
                      key={ratio.label}
                      onClick={() => handleAspectRatioChange(ratio.value)}
                      className={`px-2 py-1 text-xs rounded flex items-center space-x-1 ${
                        cropAspect === ratio.value
                          ? "bg-[var(--accent)] text-white"
                          : "card hover:"
                      }`}
                      aria-label={`Set aspect ratio to ${ratio.label}`}
                    >
                      <ratio.icon size={10} />
                      <span>{ratio.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Transform Controls */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFlipH(!flipH)}
                  className={`px-2 py-1 text-xs rounded ${
                    flipH ? "bg-[var(--accent)] text-white" : "card"
                  }`}
                  aria-label={`Flip horizontal ${flipH ? "on" : "off"}`}
                >
                  Flip H
                </button>
                <button
                  onClick={() => setFlipV(!flipV)}
                  className={`px-2 py-1 text-xs rounded ${
                    flipV ? "bg-[var(--accent)] text-white" : "card"
                  }`}
                  aria-label={`Flip vertical ${flipV ? "on" : "off"}`}
                >
                  Flip V
                </button>
              </div>
              {/* Adjustment Sliders */}
              <div className="space-y-2">
                <div>
                  <RangeInput
                    label={`Brightness`}
                    id="brightness"
                    min={0}
                    size="sm"
                    max={200}
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e))}
                  />
                </div>
                <div>
                  <RangeInput
                    label="Contrast"
                    id="contrast"
                    min={0}
                    size="sm"
                    max={200}
                    value={contrast}
                    onChange={(e) => setContrast(Number(e))}
                  />
                </div>
                <div>
                  <RangeInput
                    label="Saturation"
                    id="saturation"
                    min={0}
                    size="sm"
                    max={200}
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e))}
                  />
                </div>
              </div>
              {/* Export Settings */}
              <div className="flex w-full flex-col gap-3">
                <div>
                  <Textinput
                    type="dropdown"
                    label="Format"
                    options={[
                      { id: "jpeg", code: "JPEG" },
                      { id: "png", code: "PNG" },
                      { id: "webp", code: "WebP" },
                    ]}
                    value={format}
                    onChange={(e) => setFormat(e as ImageFormat)}
                  />
                </div>
                <div>
                  <RangeInput
                    label={`Quality ${Math.round(quality * 100)}%`}
                    id="quality"
                    min={0.1}
                    max={1}
                    step={0.1}
                    size="sm"
                    value={quality}
                    onChange={(value) => setQuality(Number(value))}
                    showMinMax={false}
                    showValue={false}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Crop area - centered */}
          <div className="p-2 rounded overflow-hidden flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={setCrop}
              onComplete={onCropComplete}
              aspect={cropAspect}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                src={currentImage}
                alt="Source"
                className="max-w-full h-auto rounded block mx-auto"
                style={getImageStyle()}
                onLoad={() => {
                  // Initialize crop after image loads
                  if (!crop && imgRef.current) {
                    const newCrop: Crop = {
                      unit: "%",
                      x: 10,
                      y: 10,
                      width: 80,
                      height: cropAspect ? 80 / cropAspect : 80,
                    };
                    setCrop(newCrop);
                  }
                }}
              />
            </ReactCrop>
          </div>

          {!crop && (
            <div className="text-center p-2 bg-[var(--accent)] rounded text-xs text-white">
              Drag to select crop area
            </div>
          )}

          {/* Preview and action buttons */}
          {croppedImage && (
            <div className="space-y-2">
              {/* Action buttons */}
              <div className="flex space-x-2">
                <Button
                  onClick={downloadImage}
                  disabled={isProcessing}
                  variant="ghost"
                  className="w-8 h-8 hidden"
                  aria-label="Download cropped image"
                  icon={<Download size={16} />}
                />
                <span
                  onClick={resetUploader}
                  className="flex items-center justify-center space-x-1 card px-3 py-2 rounded text-sm hover: transition-colors"
                  aria-label="Reset image"
                >
                  <Button variant="outline" text="Reset" />
                </span>
                {/* {shouldShowFinishButton && ( */}
                <span
                  onClick={handleFinish}
                  className="flex items-center justify-center space-x-1 card px-3 py-2 rounded text-sm hover: transition-colors"
                  aria-label="Finish"
                >
                  <Button
                    variant="primary"
                    text="Finish"
                    loading={loading || isProcessing}
                    disabled={loading}
                  />
                </span>
                {/* )}*/}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
