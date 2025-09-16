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
  | "center-right"
  | "center-left"
  | "bottom-center";

interface PopoverProps {
  clicker: React.ReactNode; // The element that triggers the popover
  children?: React.ReactNode; // Content to display in the popover - now optional
  position?: PopOverPosition;
  className?: string; // Optional className for styling
  clickerContainerClassName?: string; // Optional className for styling
  clickerClassName?: string; // Optional className for styling
  closeOnOutsideClick?: boolean; // Whether to close when clicking outside
  mobileBreakpoint?: number; // Screen width threshold for mobile behavior (default: 768px)
}

const Popover: React.FC<PopoverProps> = ({
  clicker,
  children,
  position = "bottom-left",
  className = "",
  clickerContainerClassName = "w-full flex items-center justify-center",
  clickerClassName = "w-12 h-12 cursor-pointer rounded-full flex items-center justify-center bg-[var(--background)]",
  closeOnOutsideClick = true,
  mobileBreakpoint = 670,
}) => {
  const { accentColor } = useTheme();
  const { pathname } = useGlobalState();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [clickerRect, setClickerRect] = useState<DOMRect | null>(null);
  const [popoverRect, setPopoverRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false); // New state to track positioning
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

  // Update popover dimensions when it renders - Fixed positioning logic
  useEffect(() => {
    if (isOpen && popoverRef.current && !isMobile) {
      // Use requestAnimationFrame to ensure DOM has fully rendered
      const updateDimensions = () => {
        if (popoverRef.current) {
          const rect = popoverRef.current.getBoundingClientRect();
          setPopoverRect(rect);
          setIsPositioned(true); // Mark as positioned after getting real dimensions
        }
      };

      // Give the DOM time to render the content
      requestAnimationFrame(() => {
        requestAnimationFrame(updateDimensions);
      });
    }
  }, [isOpen, isMobile, children]);

  // Reset positioning state when popover closes
  useEffect(() => {
    if (!isOpen) {
      setIsPositioned(false);
      setPopoverRect(null);
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

      if (popoverRef.current && !isMobile) {
        const popoverRect = popoverRef.current.getBoundingClientRect();
        setPopoverRect(popoverRect);
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
  }, [isOpen, isMobile]);

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

  // Helper function to get viewport dimensions
  const getViewportDimensions = () => {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  };

  // Helper function to constrain position within viewport
  const constrainToViewport = (
    top: number,
    left: number,
    popoverWidth: number,
    popoverHeight: number,
    margin = 8
  ) => {
    const viewport = getViewportDimensions();

    // Constrain horizontal position
    if (left < margin) {
      left = margin;
    } else if (left + popoverWidth > viewport.width - margin) {
      left = viewport.width - popoverWidth - margin;
    }

    // Constrain vertical position
    if (top < margin) {
      top = margin;
    } else if (top + popoverHeight > viewport.height - margin) {
      top = viewport.height - popoverHeight - margin;
    }

    return { top, left };
  };

  // Calculate popover position based on clicker position with viewport constraints
  const getPopoverStyles = (): React.CSSProperties => {
    if (!clickerRect || isMobile) return {};

    const { top, left, right, bottom, width, height } = clickerRect;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // Use actual dimensions if available, otherwise use more conservative estimates
    const popoverWidth = popoverRect?.width || 250; // Reduced default estimate
    const popoverHeight = popoverRect?.height || 150; // Reduced default estimate

    let popoverTop = 0;
    let popoverLeft = 0;
    const transform = "none";

    // Calculate initial position based on the requested position
    switch (position) {
      case "top-left":
        popoverTop = scrollY + top - popoverHeight - 8;
        popoverLeft = scrollX + right - popoverWidth;
        break;
      case "top-right":
        popoverTop = scrollY + top - popoverHeight - 8;
        popoverLeft = scrollX + left;
        break;
      case "top-center":
        popoverTop = scrollY + top - popoverHeight - 8;
        popoverLeft = scrollX + left + width / 2 - popoverWidth / 2;
        break;
      case "bottom-left":
        popoverTop = scrollY + bottom + 8;
        popoverLeft = scrollX + right - popoverWidth;
        break;
      case "bottom-right":
        popoverTop = scrollY + bottom + 8;
        popoverLeft = scrollX + left;
        break;
      case "bottom-center":
        popoverTop = scrollY + bottom + 8;
        popoverLeft = scrollX + left + width / 2 - popoverWidth / 2;
        break;
      case "center-left":
        popoverTop = scrollY + top + height / 2 - popoverHeight / 2;
        popoverLeft = scrollX + left - popoverWidth - 8;
        break;
      case "center-right":
        popoverTop = scrollY + top + height / 2 - popoverHeight / 2;
        popoverLeft = scrollX + right + 8;
        break;
      default:
        popoverTop = scrollY + bottom + 8;
        popoverLeft = scrollX + left + width / 2 - popoverWidth / 2;
        break;
    }

    // Apply viewport constraints
    const constrainedPosition = constrainToViewport(
      popoverTop,
      popoverLeft,
      popoverWidth,
      popoverHeight
    );

    // Check if we need to flip the position due to viewport constraints
    const originalTop = popoverTop;
    const originalLeft = popoverLeft;

    popoverTop = constrainedPosition.top;
    popoverLeft = constrainedPosition.left;

    // Auto-flip logic for better positioning when constrained
    if (Math.abs(originalTop - popoverTop) > 20) {
      // If vertical position was significantly adjusted, try flipping
      if (position.includes("top") && popoverTop > originalTop) {
        // Was trying to go above, but got pushed down - try below instead
        const newTop = scrollY + bottom + 8;
        const newConstrained = constrainToViewport(
          newTop,
          popoverLeft,
          popoverWidth,
          popoverHeight
        );
        if (newConstrained.top < popoverTop) {
          popoverTop = newConstrained.top;
        }
      } else if (position.includes("bottom") && popoverTop < originalTop) {
        // Was trying to go below, but got pushed up - try above instead
        const newTop = scrollY + top - popoverHeight - 8;
        const newConstrained = constrainToViewport(
          newTop,
          popoverLeft,
          popoverWidth,
          popoverHeight
        );
        if (newConstrained.top > popoverTop) {
          popoverTop = newConstrained.top;
        }
      }
    }

    if (Math.abs(originalLeft - popoverLeft) > 20) {
      // If horizontal position was significantly adjusted, try flipping
      if (position.includes("left") && popoverLeft > originalLeft) {
        // Was trying to go left, but got pushed right - try right instead
        const newLeft = scrollX + right + 8;
        const newConstrained = constrainToViewport(
          popoverTop,
          newLeft,
          popoverWidth,
          popoverHeight
        );
        if (newConstrained.left < popoverLeft) {
          popoverLeft = newConstrained.left;
        }
      } else if (position.includes("right") && popoverLeft < originalLeft) {
        // Was trying to go right, but got pushed left - try left instead
        const newLeft = scrollX + left - popoverWidth - 8;
        const newConstrained = constrainToViewport(
          popoverTop,
          newLeft,
          popoverWidth,
          popoverHeight
        );
        if (newConstrained.left > popoverLeft) {
          popoverLeft = newConstrained.left;
        }
      }
    }

    return {
      position: "absolute",
      top: popoverTop,
      left: popoverLeft,
      transform,
      transformOrigin: position.includes("top") ? "bottom" : "top",
      zIndex: 9999,
      // Hide initially until properly positioned
      opacity: isPositioned ? 1 : 0,
      transition: isPositioned ? "opacity 0.15s ease-out" : "none",
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
          // Desktop: Positioned popover with viewport constraints
          <div
            ref={popoverRef}
            style={getPopoverStyles()}
            className={`${className}`}
          >
            <div
              className="bg-[var(--background)] shadow-lg rounded-xl border min-w-max max-w-[90vw] max-h-[90vh] overflow-auto"
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
    <div className={clickerContainerClassName}>
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
