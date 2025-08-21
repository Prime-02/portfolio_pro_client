import React, { useState, useEffect, useRef, useCallback } from "react";

// Type definitions
export interface ColorValue {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  alpha: number;
}

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  onChangeComplete?: (color: string) => void;
  format?: "hex" | "rgb" | "hsl" | "hsv";
  showAlpha?: boolean;
  showPresets?: boolean;
  presets?: string[];
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

// Utility functions for color conversion
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const rgbToHsl = (
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToRgb = (
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } => {
  h /= 360;
  s /= 100;
  l /= 100;
  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

const rgbToHsv = (
  r: number,
  g: number,
  b: number
): { h: number; s: number; v: number } => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, v: v * 100 };
};

const ColorPicker: React.FC<ColorPickerProps> = ({
  value = "#ff0000",
  onChange,
  onChangeComplete,
  format = "hex",
  showAlpha = true,
  showPresets = true,
  presets = [
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
    "#000000",
    "#ffffff",
  ],
  disabled = false,
  className = "",
  size = "md",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState<ColorValue>(() => {
    const rgb = hexToRgb(value);
    return {
      hex: value,
      rgb,
      hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
      hsv: rgbToHsv(rgb.r, rgb.g, rgb.b),
      alpha: 1,
    };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<
    "saturation" | "hue" | "alpha" | null
  >(null);

  const colorAreaRef = useRef<HTMLDivElement>(null);
  const hueBarRef = useRef<HTMLDivElement>(null);
  const alphaBarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  // Update color when value prop changes
  useEffect(() => {
    const rgb = hexToRgb(value);
    const newColor = {
      hex: value,
      rgb,
      hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
      hsv: rgbToHsv(rgb.r, rgb.g, rgb.b),
      alpha: currentColor.alpha,
    };
    setCurrentColor(newColor);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateColor = useCallback(
    (newColor: ColorValue) => {
      setCurrentColor(newColor);
      const formattedColor = formatColorOutput(newColor);
      onChange?.(formattedColor); // ✅ Pass string, not object
    },
    [onChange, format, showAlpha]
  );

  const handleColorComplete = useCallback(() => {
    const formattedColor = formatColorOutput(currentColor);
    onChangeComplete?.(formattedColor); // ✅ Pass string, not object
  }, [onChangeComplete, currentColor, format, showAlpha]);

  const handleSaturationMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      setIsDragging(true);
      setDragType("saturation");
      handleSaturationMove(e);
    },
    [disabled]
  );

  const handleSaturationMove = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (!colorAreaRef.current) return;

      const rect = colorAreaRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(
        0,
        Math.min(1, 1 - (e.clientY - rect.top) / rect.height)
      );

      const newHsv = { ...currentColor.hsv, s: x * 100, v: y * 100 };
      const rgb = hslToRgb(newHsv.h, newHsv.s, newHsv.v);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

      updateColor({
        hex,
        rgb,
        hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
        hsv: newHsv,
        alpha: currentColor.alpha,
      });
    },
    [currentColor, updateColor]
  );

  const handleHueMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      setIsDragging(true);
      setDragType("hue");
      handleHueMove(e);
    },
    [disabled]
  );

  const handleHueMove = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (!hueBarRef.current) return;

      const rect = hueBarRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const hue = x * 360;

      const newHsv = { ...currentColor.hsv, h: hue };
      const rgb = hslToRgb(hue, currentColor.hsl.s, currentColor.hsl.l);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

      updateColor({
        hex,
        rgb,
        hsl: { ...currentColor.hsl, h: hue },
        hsv: newHsv,
        alpha: currentColor.alpha,
      });
    },
    [currentColor, updateColor]
  );

  const handleAlphaMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      setIsDragging(true);
      setDragType("alpha");
      handleAlphaMove(e);
    },
    [disabled]
  );

  const handleAlphaMove = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (!alphaBarRef.current) return;

      const rect = alphaBarRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

      updateColor({
        ...currentColor,
        alpha: x,
      });
    },
    [currentColor, updateColor]
  );

  // Mouse move handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      switch (dragType) {
        case "saturation":
          handleSaturationMove(e);
          break;
        case "hue":
          handleHueMove(e);
          break;
        case "alpha":
          handleAlphaMove(e);
          break;
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragType(null);
        handleColorComplete();
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    dragType,
    handleSaturationMove,
    handleHueMove,
    handleAlphaMove,
    handleColorComplete,
  ]);

  const formatColorOutput = (color: ColorValue): string => {
    switch (format) {
      case "rgb":
        return showAlpha && color.alpha < 1
          ? `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.alpha.toFixed(2)})`
          : `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
      case "hsl":
        return showAlpha && color.alpha < 1
          ? `hsla(${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s)}%, ${Math.round(color.hsl.l)}%, ${color.alpha.toFixed(2)})`
          : `hsl(${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s)}%, ${Math.round(color.hsl.l)}%)`;
      case "hsv":
        return `hsv(${Math.round(color.hsv.h)}, ${Math.round(color.hsv.s)}%, ${Math.round(color.hsv.v)}%)`;
      default:
        return color.hex;
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Color Preview Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`${sizeClasses[size]} border-2 border-[var(--foreground)] rounded-lg shadow-sm hover:border-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
        style={{
          backgroundColor: showAlpha
            ? `rgba(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b}, ${currentColor.alpha})`
            : currentColor.hex,
        }}
      >
        <span className="sr-only">Open color picker</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-[var(--background)] border border-[var(--foreground)] rounded-lg shadow-lg z-50 w-64">
          {/* Saturation/Value Area */}
          <div
            ref={colorAreaRef}
            className="relative w-full h-32 mb-3 cursor-crosshair rounded border border-[var(--foreground)]"
            style={{
              backgroundColor: `hsl(${currentColor.hsl.h}, 100%, 50%)`,
            }}
            onMouseDown={handleSaturationMouseDown}
          >
            {/* Saturation Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent"></div>
            {/* Value Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            {/* Picker Circle */}
            <div
              className="absolute w-3 h-3 border-2 border-white rounded-full shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${currentColor.hsv.s}%`,
                top: `${100 - currentColor.hsv.v}%`,
              }}
            ></div>
          </div>

          {/* Hue Bar */}
          <div
            ref={hueBarRef}
            className="relative w-full h-4 mb-3 cursor-pointer rounded border border-[var(--foreground)]"
            style={{
              background:
                "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
            }}
            onMouseDown={handleHueMouseDown}
          >
            <div
              className="absolute top-0 w-1 h-full bg-white border border-[var(--foreground)] rounded-sm transform -translate-x-1/2"
              style={{ left: `${(currentColor.hsl.h / 360) * 100}%` }}
            ></div>
          </div>

          {/* Alpha Bar */}
          {showAlpha && (
            <div
              ref={alphaBarRef}
              className="relative w-full h-4 mb-3 cursor-pointer rounded border border-[var(--foreground)]"
              style={{
                background: `linear-gradient(to right, transparent, ${currentColor.hex}), 
                           url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='checkerboard' patternUnits='userSpaceOnUse' width='8' height='8'%3e%3crect width='4' height='4' fill='%23f0f0f0'/%3e%3crect x='4' y='4' width='4' height='4' fill='%23f0f0f0'/%3e%3crect x='4' y='0' width='4' height='4' fill='%23ffffff'/%3e%3crect x='0' y='4' width='4' height='4' fill='%23ffffff'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23checkerboard)'/%3e%3c/svg%3e")`,
              }}
              onMouseDown={handleAlphaMouseDown}
            >
              <div
                className="absolute top-0 w-1 h-full bg-white border border-[var(--foreground)] rounded-sm transform -translate-x-1/2"
                style={{ left: `${currentColor.alpha * 100}%` }}
              ></div>
            </div>
          )}

          {/* Color Input */}
          <input
            type="text"
            value={formatColorOutput(currentColor)}
            onChange={(e) => {
              try {
                const rgb = hexToRgb(e.target.value);
                const newColor = {
                  hex: e.target.value,
                  rgb,
                  hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
                  hsv: rgbToHsv(rgb.r, rgb.g, rgb.b),
                  alpha: currentColor.alpha,
                };
                updateColor(newColor);
              } catch {}
            }}
            className="w-full px-3 py-2 border border-[var(--foreground)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] mb-3"
            placeholder="Enter color value"
          />

          {/* Presets */}
          {showPresets && presets.length > 0 && (
            <div className="grid grid-cols-8 gap-1">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const rgb = hexToRgb(preset);
                    const newColor = {
                      hex: preset,
                      rgb,
                      hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
                      hsv: rgbToHsv(rgb.r, rgb.g, rgb.b),
                      alpha: currentColor.alpha,
                    };
                    updateColor(newColor);
                    handleColorComplete();
                  }}
                  className="w-6 h-6 border border-[var(--foreground)] rounded hover:scale-110 transition-transform focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  style={{ backgroundColor: preset }}
                >
                  <span className="sr-only">Select {preset}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
