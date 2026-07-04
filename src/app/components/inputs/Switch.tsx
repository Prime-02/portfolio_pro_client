import React, { useRef, useMemo } from "react";
import { FaInfoCircle } from "react-icons/fa";

export interface SwitchProps {
  isSwitched: boolean;
  onSwitch: (value: boolean) => void;
  description?: string;
  showDescriptionOn?: "hover" | "switched" | "always";
  direction?: "left" | "right" | "top" | "bottom";
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({
  isSwitched,
  onSwitch,
  description,
  showDescriptionOn = "hover",
  direction = "right",
  className = "",
}) => {
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Generate unique class names for this instance
  const uniqueId = useMemo(
    () => `switch-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  const handleToggle = () => {
    onSwitch(!isSwitched);
  };

  const shouldShowDescription = (): boolean => {
    if (!description) return false;
    switch (showDescriptionOn) {
      case "switched":
        return isSwitched;
      case "always":
        return true;
      case "hover":
      default:
        return false;
    }
  };

  const getPopupStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: "absolute",
      padding: "8px 12px",
      background: "var(--background)",
      color: "var(--foreground)",
      border: "1px solid var(--accent)",
      borderRadius: "4px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      minWidth: "200px",
      maxWidth: "300px",
      zIndex: 1000,
      fontSize: "14px",
      lineHeight: "1.4",
      whiteSpace: "pre-wrap",
      opacity: shouldShowDescription() ? 1 : 0,
      visibility: shouldShowDescription() ? "visible" : "hidden",
      transition: "opacity 0.2s ease, visibility 0.2s ease",
      pointerEvents: "none" as const,
    };

    switch (direction) {
      case "left":
        return {
          ...baseStyles,
          top: "50%",
          right: "100%",
          transform: "translateY(-50%)",
          marginRight: "10px",
        };
      case "top":
        return {
          ...baseStyles,
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginBottom: "10px",
        };
      case "bottom":
        return {
          ...baseStyles,
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginTop: "10px",
        };
      case "right":
      default:
        return {
          ...baseStyles,
          top: "50%",
          left: "100%",
          transform: "translateY(-50%)",
          marginLeft: "10px",
        };
    }
  };

  // Modify popup styles for hover behavior
  const getHoverPopupStyles = (): React.CSSProperties => {
    const baseStyles = getPopupStyles();
    if (showDescriptionOn === "hover") {
      return {
        ...baseStyles,
        opacity: 0,
        visibility: "hidden",
      };
    }
    return baseStyles;
  };

  // Create scoped styles for this specific instance
  const scopedStyles = `
    .${uniqueId}-switch {
      transition: background-color 0.3s ease;
    }
    
    .${uniqueId}-knob {
      transition: transform 0.3s ease, background-color 0.3s ease;
    }
    
    .${uniqueId}-info-wrapper:hover .${uniqueId}-description-hover {
      opacity: 1 !important;
      visibility: visible !important;
    }
    
    .${uniqueId}-info-wrapper:hover .${uniqueId}-info-icon {
      opacity: 0.8;
    }
  `;

  return (
    <>
      <style>{scopedStyles}</style>
      <div className={`flex items-center gap-3 ${className}`}>
        <button
          type="button"
          className={`${uniqueId}-switch relative inline-flex h-6 w-12 items-center rounded-full focus:outline-none transition-colors duration-200`}
          style={{
            backgroundColor: isSwitched ? "var(--foreground)" : "var(--background)",
            border: "2px solid var(--accent)",
          }}
          onClick={handleToggle}
          aria-checked={isSwitched}
          aria-describedby={description ? `switch-${description}` : undefined}
        >
          <span
            className={`${uniqueId}-knob absolute inline-block h-4 w-4 cursor-pointer rounded-full`}
            style={{
              backgroundColor: "var(--accent)",
              transform: isSwitched ? "translateX(24px)" : "translateX(4px)",
            }}
          />
        </button>

        {description && (
          <div
            className={`${uniqueId}-info-wrapper`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              position: "relative",
            }}
          >
            {(showDescriptionOn === "hover" ||
              showDescriptionOn === "always") && (
                <FaInfoCircle
                  className={`${uniqueId}-info-icon`}
                  style={{
                    color: "var(--accent)",
                    cursor: "help",
                    fontSize: "16px",
                    transition: "opacity 0.2s ease",
                  }}
                />
              )}
            <div
              id={`switch-${description}`}
              className={
                showDescriptionOn === "hover"
                  ? `${uniqueId}-description-hover`
                  : ""
              }
              style={getHoverPopupStyles()}
              ref={descriptionRef}
            >
              {description}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Switch;