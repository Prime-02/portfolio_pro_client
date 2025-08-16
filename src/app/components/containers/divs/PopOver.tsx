import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../../theme/ThemeContext ";
import { getColorShade } from "../../utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";

export type PopOverPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

interface PopoverProps {
  clicker: React.ReactNode; // The element that triggers the popover
  children?: React.ReactNode; // Content to display in the popover - now optional
  position?: PopOverPosition;
  className?: string; // Optional className for styling
  clickerClassName?: string; // Optional className for styling
  closeOnOutsideClick?: boolean; // Whether to close when clicking outside
  mobileBreakpoint?: number; // Screen width threshold for mobile behavior (default: 768px)
}

const Popover: React.FC<PopoverProps> = ({
  clicker,
  children,
  position = "bottom-center",
  className = "",
  clickerClassName = "w-12 h-12 cursor-pointer rounded-full flex items-center justify-center bg-[var(--background)]",
  closeOnOutsideClick = true,
  mobileBreakpoint = 475,
}) => {
  const { accentColor } = useTheme();
  const { pathname } = useGlobalState();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [clickerRect, setClickerRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const clickerRef = useRef<HTMLDivElement>(null);

  // Handle mounting for SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update clicker position when popover opens
  useEffect(() => {
    if (isOpen && clickerRef.current) {
      const rect = clickerRef.current.getBoundingClientRect();
      setClickerRect(rect);
    }
  }, [isOpen]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isOpen || !clickerRef.current) return;

    const updatePosition = () => {
      const rect = clickerRef.current?.getBoundingClientRect();
      if (rect) {
        setClickerRect(rect);
      }
    };

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  // Check if screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [mobileBreakpoint]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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

  // Calculate popover position based on clicker position
  const getPopoverStyles = (): React.CSSProperties => {
    if (!clickerRect || isMobile) return {};

    const { top, left, right, bottom, width, height } = clickerRect;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let popoverTop = 0;
    let popoverLeft = 0;

    switch (position) {
      case "top-left":
        popoverTop = scrollY + top - 8; // 8px margin
        popoverLeft = scrollX + right;
        break;
      case "top-right":
        popoverTop = scrollY + top - 8;
        popoverLeft = scrollX + left;
        break;
      case "top-center":
        popoverTop = scrollY + top - 8;
        popoverLeft = scrollX + left + width / 2;
        break;
      case "bottom-left":
        popoverTop = scrollY + bottom + 8;
        popoverLeft = scrollX + right;
        break;
      case "bottom-right":
        popoverTop = scrollY + bottom + 8;
        popoverLeft = scrollX + left;
        break;
      case "bottom-center":
      default:
        popoverTop = scrollY + bottom + 8;
        popoverLeft = scrollX + left + width / 2;
        break;
    }

    return {
      position: "absolute",
      top: popoverTop,
      left: popoverLeft,
      transform: position.includes("center")
        ? "translateX(-50%)"
        : position.includes("left")
          ? "translateX(-100%)"
          : "none",
      transformOrigin: position.includes("top") ? "bottom" : "top",
      zIndex: 9999,
    };
  };

  // Mobile overlay styles
  const getMobileStyles = (): React.CSSProperties => {
    if (!isMobile) return {};

    return {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10000,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
    };
  };

  const renderPopoverContent = () => {
    if (!mounted || !isOpen || !children) return null;

    const content = (
      <>
        {isMobile ? (
          // Mobile: Full screen overlay
          <div style={getMobileStyles()}>
            <div
              ref={popoverRef}
              className={`w-full max-w-md relative max-h-[80vh] overflow-y-auto ${className}`}
            >
              <div
                className="bg-[var(--background)] overflow-auto shadow-lg rounded-xl pt-3 border"
                style={{ borderColor: accentColor.color }}
              >
                <div className="px-4 pb-4">{children}</div>
              </div>
            </div>
          </div>
        ) : (
          // Desktop: Positioned popover
          <div
            ref={popoverRef}
            style={getPopoverStyles()}
            className={`${className}`}
          >
            <div
              className="bg-[var(--background)] shadow-lg rounded-xl border min-w-max"
              style={{ borderColor: accentColor.color }}
            >
              {children}
            </div>
          </div>
        )}
      </>
    );

    // Use portal to render at document body level
    return createPortal(content, document.body);
  };

  return (
    <div className="relative inline-block">
      <div
        ref={clickerRef}
        onClick={togglePopover}
        className={` ${clickerClassName}   ${isOpen ? "" : ""}`}
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

      {renderPopoverContent()}
    </div>
  );
};

export default Popover;
