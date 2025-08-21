import React, { useRef, useMemo } from "react";
import { FaCheck, FaInfoCircle } from "react-icons/fa";
import { useTheme } from "../theme/ThemeContext ";

interface CheckBoxProps {
  isChecked: boolean;
  setIsChecked: (checked: boolean) => void;
  target?: boolean;
  id?: string;
  description?: string;
  showDescriptionOn?: "hover" | "checked" | "always";
  direction?: "left" | "right" | "top" | "bottom";
  label?: string;
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
}) => {
  const { theme, accentColor } = useTheme();
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Generate unique class names for this instance
  const uniqueId = useMemo(
    () => `checkbox-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const handleCheckboxTarget = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };

  const shouldShowDescription = (): boolean => {
    if (!description) return false;
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
      background: theme.background,
      color: theme.foreground,
      border: `1px solid ${accentColor.color}`,
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

  const checkboxStyles: React.CSSProperties = {
    backgroundColor: isChecked ? accentColor.color : theme.background,
    borderRadius: "5px",
    width: "25px",
    height: "25px",
    border: `2px solid ${accentColor.color}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background-color 0.3s ease, transform 0.5s ease-out",
    position: "relative",
    overflow: "hidden",
    transform: isChecked ? "scale(1)" : "scale(1)",
    animation: isChecked ? `${uniqueId}-bounce 0.5s ease-out` : undefined,
  };

  const checkIconStyles: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "white",
    fontSize: "14px",
    opacity: isChecked ? 1 : 0,
    animation: isChecked
      ? `${uniqueId}-checkAppear 0.3s ease-out 0.1s both`
      : "none",
    pointerEvents: "none",
  };

  const containerStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    position: "relative",
    maxWidth: "400px",
    width: "auto",
  };

  const checkboxWrapperStyles: React.CSSProperties = {
    position: "relative",
  };

  const inputStyles: React.CSSProperties = {
    position: "absolute",
    opacity: 0,
    cursor: "pointer",
    width: "25px",
    height: "25px",
    margin: 0,
    zIndex: 10,
  };

  const infoIconWrapperStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    height: "25px",
    position: "relative",
  };

  const infoIconStyles: React.CSSProperties = {
    color: accentColor.color,
    cursor: "help",
    fontSize: "16px",
    transition: "color 0.2s ease, opacity 0.2s ease",
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
    
    .${uniqueId}-info-wrapper:hover .${uniqueId}-description-hover {
      opacity: 1 !important;
      visibility: visible !important;
    }
    
    .${uniqueId}-info-wrapper:hover .${uniqueId}-info-icon {
      opacity: 0.8;
    }
  `;

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

  return (
    <>
      <style>{scopedStyles}</style>
      <div className="flex items-center gap-x-2">
        <div style={containerStyles}>
          <div style={checkboxWrapperStyles}>
            <input
              id={id}
              type="checkbox"
              style={inputStyles}
              checked={isChecked}
              onChange={target ? handleCheckboxTarget : handleCheckboxChange}
              aria-checked={isChecked}
              aria-describedby={description ? `${id}-description` : undefined}
            />
            <div style={checkboxStyles}>
              <FaCheck style={checkIconStyles} />
            </div>
          </div>

          {description && (
            <div
              className={`${uniqueId}-info-wrapper`}
              style={infoIconWrapperStyles}
            >
              {(showDescriptionOn === "hover" ||
                showDescriptionOn === "always") && (
                <FaInfoCircle
                  className={`${uniqueId}-info-icon`}
                  style={infoIconStyles}
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
        <span className="text-xs text-[var(--accent)] ">{label}</span>
      </div>
    </>
  );
};

export default CheckBox;
