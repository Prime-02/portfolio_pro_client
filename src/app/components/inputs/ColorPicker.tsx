import React, { useState, useEffect, useRef, useCallback } from "react";

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  onChangeComplete?: (color: string) => void;
  showPresets?: boolean;
  presets?: string[];
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

// Convert hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 255, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
};

// Convert RGB to HSV
const rgbToHsv = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  const s = max === 0 ? 0 : diff / max;
  const v = max;

  if (diff !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / diff + 2) * 60;
        break;
      case b:
        h = ((r - g) / diff + 4) * 60;
        break;
    }
  }

  return { h, s, v };
};

// Convert HSV to hex
const hsvToHex = (h: number, s: number, v: number): string => {
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Get pure hue color (max saturation and value)
const getPureHueColor = (hue: number): string => hsvToHex(hue, 1, 1);

// Apply a new color to all internal state atomically. Used by preset click,
// hex input, and external value sync so the logic lives in one place.
const applyColorToHsv = (hex: string) => {
  const rgb = hexToRgb(hex);
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
};

const ColorPicker: React.FC<ColorPickerProps> = ({
  value = "#ff0000",
  onChange,
  onChangeComplete,
  showPresets = true,
  presets = [
    "#ff0000", "#00ff00", "#0000ff", "#ffff00",
    "#ff00ff", "#00ffff", "#000000", "#ffffff",
  ],
  disabled = false,
  className = "",
  size = "md",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState(value);

  const initialHsv = applyColorToHsv(value);
  const [hue, setHue] = useState(initialHsv.h);
  const [saturation, setSaturation] = useState(initialHsv.s);
  const [brightness, setBrightness] = useState(initialHsv.v);

  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<"saturation" | "hue" | null>(null);

  const colorAreaRef = useRef<HTMLDivElement>(null);
  const hueBarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const saturationRef = useRef(saturation);
  const brightnessRef = useRef(brightness);
  const hueRef = useRef(hue);

  // Tracks the most recent color this component emitted via onChange so we
  // can distinguish our own echoed value from a genuine external change.
  // CRITICAL: must be set synchronously before calling onChange, not after,
  // so the useEffect sync guard sees it on the very next render.
  const lastEmittedRef = useRef(value);

  useEffect(() => { saturationRef.current = saturation; }, [saturation]);
  useEffect(() => { brightnessRef.current = brightness; }, [brightness]);
  useEffect(() => { hueRef.current = hue; }, [hue]);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  // Sync external value changes into internal HSV state.
  // Skipped while dragging (onChange round-trips back here on every mousemove)
  // and when the incoming value is just an echo of what we last emitted.
  useEffect(() => {
    if (isDragging) return;
    if (value === currentColor) return;
    if (value === lastEmittedRef.current) {
      // Our own edit echoed back unchanged — reconcile currentColor only,
      // no HSV recompute (hex->HSV is lossy so it can perturb hue mid-drag).
      setCurrentColor(value);
      return;
    }
    // Genuine external change (e.g. theme preset selected in parent).
    setCurrentColor(value);
    const hsv = applyColorToHsv(value);
    setHue(hsv.h);
    setSaturation(hsv.s);
    setBrightness(hsv.v);
    hueRef.current = hsv.h;
    saturationRef.current = hsv.s;
    brightnessRef.current = hsv.v;
  }, [value, isDragging]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Shared emit helper — always set lastEmittedRef BEFORE calling onChange
  // so any synchronous re-render triggered by onChange sees the guard value.
  const emit = useCallback((color: string, complete = false) => {
    lastEmittedRef.current = color;
    onChange?.(color);
    if (complete) onChangeComplete?.(color);
  }, [onChange, onChangeComplete]);

  const updateSaturation = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!colorAreaRef.current) return;
    const rect = colorAreaRef.current.getBoundingClientRect();
    const s = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const v = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    setSaturation(s);
    setBrightness(v);
    saturationRef.current = s;
    brightnessRef.current = v;
    const newColor = hsvToHex(hueRef.current, s, v);
    setCurrentColor(newColor);
    emit(newColor);
  }, [emit]);

  const updateHue = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!hueBarRef.current) return;
    const rect = hueBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newHue = x * 360;
    setHue(newHue);
    hueRef.current = newHue;
    const newColor = hsvToHex(newHue, saturationRef.current, brightnessRef.current);
    setCurrentColor(newColor);
    emit(newColor);
  }, [emit]);

  const handleSaturationMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    setDragType("saturation");
    updateSaturation(e);
  }, [disabled, updateSaturation]);

  const handleHueMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    setDragType("hue");
    updateHue(e);
  }, [disabled, updateHue]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      if (dragType === "saturation") updateSaturation(e);
      if (dragType === "hue") updateHue(e);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragType(null);
        onChangeComplete?.(currentColor);
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
  }, [isDragging, dragType, updateSaturation, updateHue, onChangeComplete, currentColor]);

  // Apply a fully-resolved color to all internal state and emit it.
  // Used by preset swatches and hex input to avoid duplicating this logic.
  const applyColor = useCallback((hex: string, complete = false) => {
    const hsv = applyColorToHsv(hex);
    setCurrentColor(hex);
    setHue(hsv.h);
    setSaturation(hsv.s);
    setBrightness(hsv.v);
    hueRef.current = hsv.h;
    saturationRef.current = hsv.s;
    brightnessRef.current = hsv.v;
    emit(hex, complete);
  }, [emit]);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Color Preview Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`${sizeClasses[size]} border-2 border-[var(--foreground)] rounded-lg shadow-sm hover:border-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
        style={{ backgroundColor: currentColor }}
      >
        <span className="sr-only">Open color picker</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-[var(--background)] border border-[var(--foreground)] rounded-lg shadow-lg z-50 w-64">
          {/* Saturation/Brightness Area */}
          <div
            ref={colorAreaRef}
            className="relative w-full h-32 mb-3 cursor-crosshair rounded border border-[var(--foreground)]"
            style={{ backgroundColor: getPureHueColor(hue) }}
            onMouseDown={handleSaturationMouseDown}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            <div
              className="absolute w-3 h-3 border-2 border-white rounded-full shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${saturation * 100}%`,
                top: `${(1 - brightness) * 100}%`,
              }}
            />
          </div>

          {/* Hue Bar */}
          <div
            ref={hueBarRef}
            className="relative w-full h-4 mb-3 cursor-pointer rounded border border-[var(--foreground)]"
            style={{
              background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
            }}
            onMouseDown={handleHueMouseDown}
          >
            <div
              className="absolute top-0 w-1 h-full bg-white border border-[var(--foreground)] rounded-sm transform -translate-x-1/2"
              style={{ left: `${(hue / 360) * 100}%` }}
            />
          </div>

          {/* Hex Input */}
          <input
            type="text"
            value={currentColor}
            onChange={(e) => {
              const val = e.target.value;
              if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                applyColor(val);
              } else {
                // Allow typing incomplete values without emitting
                setCurrentColor(val);
              }
            }}
            onBlur={() => {
              if (!/^#[0-9A-Fa-f]{6}$/.test(currentColor)) {
                applyColor("#ff0000", true);
              } else {
                onChangeComplete?.(currentColor);
              }
            }}
            className="w-full px-3 py-2 border border-[var(--foreground)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] mb-3"
            placeholder="#000000"
          />

          {/* Presets */}
          {showPresets && presets.length > 0 && (
            <div className="grid grid-cols-8 gap-1">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => applyColor(preset, true)}
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