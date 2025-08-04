import React from "react";
import { FaInfoCircle } from "react-icons/fa";

interface SwitchProps {
  isSwitched: boolean;
  onSwitch: (value: boolean) => void;
  description?: string;
  showDescriptionOn?: "hover" | "switched" | "always";
  direction?: "left" | "right" | "top" | "bottom";
}

const Switch: React.FC<SwitchProps> = ({
  isSwitched,
  onSwitch,
  description,
  showDescriptionOn = "hover",
  direction = "right",
}) => {
  const handleToggle = () => {
    onSwitch(!isSwitched);
  };

  const shouldShowDescription = () => {
    if (!description) return false;
    switch (showDescriptionOn) {
      case "hover":
        return false; // Will be handled by CSS hover
      case "switched":
        return isSwitched;
      case "always":
        return true;
      default:
        return false;
    }
  };

  const getPopupStyles = () => {
    const baseStyles = {
      position: "absolute" as const,
      padding: "8px 12px",
      background: "var(--background)",
      color: "var(--text)",
      border: "1px solid var(--accent)",
      borderRadius: "4px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      minWidth: "200px",
      maxWidth: "300px",
      zIndex: 10,
      fontSize: "14px",
      lineHeight: "1.4",
      whiteSpace: "pre-wrap" as const,
      opacity: 0,
      visibility: "hidden" as const,
      transition: "opacity 0.2s, visibility 0.2s",
    };

    switch (direction) {
      case "left":
        return {
          ...baseStyles,
          right: "100%",
          top: "50%",
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
          left: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          marginLeft: "10px",
        };
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className={`relative inline-flex h-6 w-12 items-center rounded-full focus:outline-none border border-gray-400 transition-colors duration-200 ${
          isSwitched ? "bg-[var(--foreground)]" : "bg-[var(--background)]"
        }`}
        onClick={handleToggle}
        aria-checked={isSwitched}
        aria-describedby={description ? `switch-${description}` : undefined}
      >
        <span
          className={`absolute inline-block h-4 w-4 cursor-pointer rounded-full bg-[var(--accent)] transform transition-all duration-700 ${
            isSwitched ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>

      {description && (
        <div className="description-container relative inline-flex items-center">
          {(showDescriptionOn === "hover" ||
            showDescriptionOn === "always") && (
            <FaInfoCircle className="info-icon text-[var(--accent)] cursor-help ml-1" />
          )}
          <div
            id={`switch-${description}`}
            className={`description-popup ${
              shouldShowDescription() ? "visible" : ""
            } ${showDescriptionOn === "hover" ? "hover-trigger" : ""}`}
            style={getPopupStyles()}
          >
            {description}
          </div>
        </div>
      )}

      <style jsx>{`
        .description-popup.visible {
          opacity: 1 !important;
          visibility: visible !important;
        }

        .description-popup.hover-trigger {
          opacity: 0;
          visibility: hidden;
        }

        .description-container:hover .description-popup.hover-trigger {
          opacity: 1 !important;
          visibility: visible !important;
        }
      `}</style>
    </div>
  );
};

export default Switch;
