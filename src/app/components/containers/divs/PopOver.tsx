import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "../../theme/ThemeContext ";
import { getColorShade } from "../../utilities/syncFunctions/syncs";

interface PopoverProps {
  clicker: React.ReactNode; // The element that triggers the popover
  children: React.ReactNode; // Content to display in the popover
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center"; // Position options
  className?: string; // Optional className for styling
  closeOnOutsideClick?: boolean; // Whether to close when clicking outside
}

const Popover: React.FC<PopoverProps> = ({
  clicker,
  children,
  position = "bottom-center",
  className = "",
  closeOnOutsideClick = true,
}) => {
  const { accentColor } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const clickerRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        closeOnOutsideClick &&
        isOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        clickerRef.current &&
        !clickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeOnOutsideClick]);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const togglePopover = () => {
    setIsOpen(!isOpen);
  };

  // Position classes
  const getPositionClass = () => {
    switch (position) {
      case "top-left":
        return "bottom-full right-0 mb-2";
      case "top-right":
        return "bottom-full left-0 mb-2";
      case "top-center":
        return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
      case "bottom-left":
        return "top-full right-0 mt-2";
      case "bottom-right":
        return "top-full left-0 mt-2";
      case "bottom-center":
        return "top-full left-1/2 transform -translate-x-1/2 mt-2";
      default:
        return "top-full left-1/2 transform -translate-x-1/2 mt-2";
    }
  };

  return (
    <div className="relative inline-block">
      <div
        ref={clickerRef}
        onClick={togglePopover}
        className={`cursor-pointer rounded-full w-12 h-12 flex items-center justify-center bg-[var(--background)]  ${isOpen ? "" : ""}`}
        style={
          isOpen
            ? {
                borderColor: accentColor.color,
                color: accentColor.color,
                backgroundColor: getColorShade(accentColor.color, 85),
              }
            : {}
        }
      >
        {clicker}
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          className={`absolute z-50 ${getPositionClass()} ${className}`}
        >
          <div
            className="bg-[var(--background)] shadow-lg rounded-md border"
            style={{ borderColor: accentColor.color }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default Popover;
