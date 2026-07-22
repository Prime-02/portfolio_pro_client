import React, { useRef, useMemo } from "react";
import { FaCheck, FaInfoCircle, FaSpinner } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

export interface CheckBoxProps {
  isChecked: boolean;
  setIsChecked: (checked: boolean) => void;
  target?: boolean;
  id?: string;
  description?: string;
  showDescriptionOn?: "hover" | "checked" | "always";
  direction?: "left" | "right" | "top" | "bottom";
  label?: string;
  className?: string;
  labelClassName?: string;
  disabled?: boolean;
  loading?: boolean;
}

const CheckBox: React.FC<CheckBoxProps> = ({
  isChecked,
  setIsChecked,
  target = false,
  id = "check",
  description,
  showDescriptionOn = "hover",
  direction = "right",
  label = "",
  className = "",
  labelClassName = "",
  disabled = false,
  loading = false,
}) => {
  const { theme, accentColor } = useTheme();
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Generate unique class names for this instance
  const uniqueId = useMemo(
    () => `checkbox-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  const handleCheckboxChange = () => {
    if (!disabled && !loading) {
      setIsChecked(!isChecked);
    }
  };

  const handleCheckboxTarget = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled && !loading) {
      setIsChecked(e.target.checked);
    }
  };

  const shouldShowDescription = (): boolean => {
    if (!description || disabled) return false;
    switch (showDescriptionOn) {
      case "checked":
        return isChecked;
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
      background: "var(--background, " + theme.background + ")",
      color: "var(--foreground, " + theme.foreground + ")",
      border: "1px solid var(--accent, " + accentColor.color + ")",
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
    if (showDescriptionOn === "hover" && !disabled) {
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
    @keyframes ${uniqueId}-bounce {
      0% { transform: scale(1); }
      40% { transform: scale(1.5, 0.5); }
      50% { transform: scale(0.5, 1.5); }
      60% { transform: scale(1.3, 0.7); }
      70% { transform: scale(0.8, 1.2); }
      100% { transform: scale(1); }
    }
    
    @keyframes ${uniqueId}-checkAppear {
      0% { 
        opacity: 0; 
        transform: translate(-50%, -50%) scale(0.5); 
      }
      100% { 
        opacity: 1; 
        transform: translate(-50%, -50%) scale(1); 
      }
    }
    
    @keyframes ${uniqueId}-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .${uniqueId}-info-wrapper:hover .${uniqueId}-description-hover {
      opacity: 1 !important;
      visibility: visible !important;
    }
    
    .${uniqueId}-info-wrapper:hover .${uniqueId}-info-icon {
      opacity: 0.8;
    }

    .${uniqueId}-disabled {
      opacity: 0.5;
      cursor: not-allowed !important;
    }
  `;

  const isInteractive = !disabled && !loading;

  return (
    <>
      <style>{scopedStyles}</style>
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          position: "relative",
          maxWidth: "400px",
          width: "auto",
        }}>
          <div style={{ position: "relative" }}>
            <input
              id={id}
              type="checkbox"
              style={{
                position: "absolute",
                opacity: 0,
                cursor: isInteractive ? "pointer" : "not-allowed",
                width: "25px",
                height: "25px",
                margin: 0,
                zIndex: 10,
              }}
              checked={isChecked}
              onChange={target ? handleCheckboxTarget : handleCheckboxChange}
              disabled={disabled || loading}
              aria-checked={isChecked}
              aria-disabled={disabled || loading}
              aria-describedby={description ? `${id}-description` : undefined}
            />
            <div
              style={{
                backgroundColor: isChecked
                  ? (disabled || loading ? "var(--muted-foreground, #9ca3af)" : "var(--accent, " + accentColor.color + ")")
                  : "var(--background, " + theme.background + ")",
                borderRadius: "5px",
                width: "25px",
                height: "25px",
                border: `2px solid ${disabled || loading ? "var(--muted-foreground, #9ca3af)" : "var(--accent, " + accentColor.color + ")"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: isInteractive ? "pointer" : "not-allowed",
                transition: "background-color 0.3s ease, transform 0.5s ease-out, border-color 0.3s ease",
                position: "relative",
                overflow: "hidden",
                transform: isChecked ? "scale(1)" : "scale(1)",
                animation: isChecked && isInteractive ? `${uniqueId}-bounce 0.5s ease-out` : undefined,
                opacity: disabled || loading ? 0.5 : 1,
              }}
              className={disabled || loading ? `${uniqueId}-disabled` : ""}
            >
              {loading ? (
                <FaSpinner
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "var(--muted-foreground, #9ca3af)",
                    fontSize: "14px",
                    animation: `${uniqueId}-spin 1s linear infinite`,
                    pointerEvents: "none",
                  }}
                />
              ) : (
                <FaCheck
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: disabled ? "var(--muted, #d1d5db)" : "var(--background, white)",
                    fontSize: "14px",
                    opacity: isChecked ? 1 : 0,
                    animation: isChecked && isInteractive
                      ? `${uniqueId}-checkAppear 0.3s ease-out 0.1s both`
                      : "none",
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
          </div>

          {description && !disabled && (
            <div
              className={`${uniqueId}-info-wrapper`}
              style={{
                display: "flex",
                alignItems: "center",
                height: "25px",
                position: "relative",
              }}
            >
              {(showDescriptionOn === "hover" ||
                showDescriptionOn === "always") && (
                  <FaInfoCircle
                    className={`${uniqueId}-info-icon`}
                    style={{
                      color: "var(--accent, " + accentColor.color + ")",
                      cursor: "help",
                      fontSize: "16px",
                      transition: "color 0.2s ease, opacity 0.2s ease",
                    }}
                  />
                )}
              <div
                id={`${id}-description`}
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
        {label && (
          <span
            className={`text-xs ${labelClassName} ${disabled || loading ? `${uniqueId}-disabled` : ""}`}
            style={{
              color: disabled || loading ? "var(--muted-foreground, #9ca3af)" : "var(--accent, " + accentColor.color + ")",
              cursor: disabled || loading ? "not-allowed" : "default",
            }}
          >
            {label}
          </span>
        )}
      </div>
    </>
  );
};

export default CheckBox;