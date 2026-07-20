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
  size?: "sm" | "md" | "lg";
  id?: string;
  showSteps?: boolean;
  stepLabelInterval?: number;
}

const RangeInput = ({
  min = 0,
  max = 100,
  value = 50,
  step = 1,
  onChange,
  label,
  showValue = true,
  showMinMax = true,
  disabled = false,
  className = "",
  id = "range-input",
  size = "md",
  showSteps = true,
  stepLabelInterval = 0,
}: RangeInputProps) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Taller tracks to contain ruler ticks inside
  const sizeConfig = {
    sm: {
      trackHeight: 24,
      thumbWidth: 6,
      thumbHeight: 32,
      tickHeight: 12,
      tickWidth: 1.5,
      majorTickHeight: 18,
      fontSize: "text-xs",
    },
    md: {
      trackHeight: 32,
      thumbWidth: 8,
      thumbHeight: 44,
      tickHeight: 16,
      tickWidth: 2,
      majorTickHeight: 24,
      fontSize: "text-sm",
    },
    lg: {
      trackHeight: 44,
      thumbWidth: 10,
      thumbHeight: 56,
      tickHeight: 22,
      tickWidth: 2.5,
      majorTickHeight: 34,
      fontSize: "text-base",
    },
  };

  const config = sizeConfig[size];

  // Generate step positions
  const getStepPositions = () => {
    if (!showSteps || step <= 0) return [];
    const steps = [];
    const stepCount = Math.floor((max - min) / step);
    const majorInterval = Math.max(1, Math.floor(stepCount / 10));

    for (let i = 0; i <= stepCount; i++) {
      const stepValue = min + i * step;
      const stepPercentage = ((stepValue - min) / (max - min)) * 100;
      steps.push({
        value: stepValue,
        position: stepPercentage,
        isMajor: i % majorInterval === 0,
      });
    }
    return steps;
  };

  const stepPositions = getStepPositions();

  // Handle precise dragging
  const handleDrag = (clientX: number) => {
    if (!trackRef.current || disabled) return;

    const rect = trackRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const trackWidth = rect.width;
    const newPercentage = Math.max(0, Math.min(100, (offsetX / trackWidth) * 100));
    const newValue = min + (newPercentage / 100) * (max - min);
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));

    if (onChange) {
      onChange(Number(clampedValue.toFixed(2)));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleDrag(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) handleDrag(e.clientX);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleDrag(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) handleDrag(e.touches[0].clientX);
  };

  const handleTouchEnd = () => setIsDragging(false);

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
      {/* Label row */}
      {label && (
        <div className="flex items-center justify-between mb-3">
          <label
            htmlFor={id}
            className={`${config.fontSize} font-medium text-[var(--foreground)] opacity-70`}
          >
            {label}
          </label>
          {showValue && (
            <span className={`${config.fontSize} font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-1 rounded-md`}>
              {value}
            </span>
          )}
        </div>
      )}

      {/* Slider container */}
      <div className="relative flex items-center" style={{ height: `${config.thumbHeight}px` }}>

        {/* Track */}
        <div
          ref={trackRef}
          className="relative w-full rounded-lg bg-[var(--background)] border border-[var(--foreground)]/10 overflow-hidden shadow-inner"
          style={{ height: `${config.trackHeight}px` }}
        >
          {/* Fill */}
          <div
            className="absolute top-0 left-0 h-full bg-[var(--accent)]/90 rounded-lg transition-all duration-150 ease-out"
            style={{ width: `${percentage}%` }}
          />

          {/* Ruler ticks — INSIDE the track */}
          {showSteps && stepPositions.length > 0 && (
            <div className="absolute inset-0 pointer-events-none flex items-end">
              {stepPositions.map((step, index) => {
                const isMajor = step.isMajor;
                const tickHeight = isMajor ? config.majorTickHeight : config.tickHeight;
                const tickOpacity = isMajor ? 0.35 : 0.2;
                const tickWidth = isMajor ? config.tickWidth * 1.5 : config.tickWidth;

                return (
                  <div
                    key={index}
                    className="absolute bottom-0 flex flex-col items-center justify-end"
                    style={{ left: `${step.position}%`, transform: 'translateX(-50%)' }}
                  >
                    <div
                      className="rounded-full"
                      style={{
                        width: `${tickWidth}px`,
                        height: `${tickHeight}px`,
                        backgroundColor: `var(--foreground)`,
                        opacity: tickOpacity,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Invisible native input for accessibility */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange && onChange(Number(e.target.value))}
          disabled={disabled}
          className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          style={{ height: `${config.thumbHeight}px` }}
        />

        {/* Custom Thumb — BAR STYLE */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-sm shadow-lg border-[2px] border-[var(--background)] bg-[var(--accent)] transition-all duration-150 ease-out pointer-events-none
            ${disabled ? "opacity-40" : "hover:scale-y-110 hover:shadow-xl"} 
            ${isDragging ? "scale-y-110 shadow-xl ring-[2px] ring-[var(--accent)]/25" : ""}`}
          style={{
            left: `${percentage}%`,
            width: `${config.thumbWidth}px`,
            height: `${config.thumbHeight}px`,
            borderRadius: "3px",
          }}
        />
      </div>

      {/* Min/Max labels */}
      {showMinMax && (
        <div className="flex justify-between text-xs text-[var(--foreground)] opacity-50 mt-2 font-medium">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

export default RangeInput;



export const PBRangeInput: React.FC<RangeInputProps> = (props) => {
  return (
    <div
      style={{
        // Remap standard theme variables to portfolio theme variables
        "--foreground": "var(--pb-foreground)",
        "--background": "var(--pb-background)",
        "--accent": "var(--pb-accent)",
      } as React.CSSProperties}
    >
      <RangeInput
        {...props}
        className={`
          ${props.className || ""}
        `}
      />
    </div>
  );
};