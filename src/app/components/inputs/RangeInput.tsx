import React, { useState, useRef, useEffect } from "react";

export interface RangeInputProps {
  min?: number;
  max?: number;
  value?: number;
  step?: number;
  onChange?: (value: number) => void;
  label: string;
  showValue?: boolean;
  showMinMax?: boolean;
  disabled?: boolean;
  className?: string;
  trackColor?: string;
  thumbColor?: string;
  fillColor?: string;
  size?: "sm" | "md" | "lg";
  id?: string;
}

const RangeInput = ({
  min = 0,
  max = 100,
  value = 50,
  step = 1, // Fine step for precise control
  onChange,
  label,
  showValue = true,
  showMinMax = true,
  disabled = false,
  className = "",
  id = "range-input",
  size = "md",
}: RangeInputProps) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const thumbSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  // Handle precise dragging
  const handleDrag = (clientX: number) => {
    if (!trackRef.current || disabled) return;

    const rect = trackRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const trackWidth = rect.width;
    const newPercentage = Math.max(
      0,
      Math.min(100, (offsetX / trackWidth) * 100)
    );
    const newValue = min + (newPercentage / 100) * (max - min);
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));

    if (onChange) {
      onChange(Number(clampedValue.toFixed(2)));
    }
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleDrag(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handleDrag(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleDrag(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      handleDrag(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add/remove global event listeners for mouse and touch
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium opacity-65 mb-2"
        >
          {label}
          {showValue && (
            <span className="ml-2 text-[var(--accent)] font-semibold">
              {value}
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {/* Track */}
        <div
          className={`w-full ${sizeClasses[size]} bg-[var(--background)] rounded-full`}
          ref={trackRef}
        >
          {/* Fill */}
          <div
            className={`${sizeClasses[size]} bg-[var(--accent)] rounded-full transition-all duration-150`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Input */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange && onChange(Number(e.target.value))}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        {/* Custom Thumb */}
        <div
          ref={thumbRef}
          className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 ${thumbSizeClasses[size]} bg-[var(--accent)] rounded-full shadow-md border border-[var(--foreground)] transition-all duration-150 ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-110 cursor-grab"} ${isDragging ? "cursor-grabbing" : ""}`}
          style={{ left: `${percentage}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        />
      </div>

      {showMinMax && (
        <div className="flex justify-between text-xs opacity-65 mt-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

export default RangeInput;
