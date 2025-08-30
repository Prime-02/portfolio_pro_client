import React, { useEffect, useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface SidebarToggleProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  className?: string;
  showKeyboardHints?: boolean;
}

const SidebarToggle: React.FC<SidebarToggleProps> = ({
  isCollapsed = false,
  onToggle,
  className = "",
  showKeyboardHints = true,
}) => {
  const [localIsCollapsed, setLocalIsCollapsed] =
    useState<boolean>(isCollapsed);

  // Use controlled state if onToggle is provided, otherwise use local state
  const collapsed: boolean = onToggle ? isCollapsed : localIsCollapsed;
  const toggle: () => void =
    onToggle || (() => setLocalIsCollapsed(!localIsCollapsed));

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      // Check if Ctrl is pressed along with the specific keys
      if (event.ctrlKey) {
        if (event.key === "/") {
          event.preventDefault();
          if (collapsed) {
            toggle();
          }
        } else if (event.key === "\\") {
          event.preventDefault();
          if (!collapsed) {
            toggle();
          }
        }
      }
    };

    // Add event listener to document for global keyboard shortcuts
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [collapsed, toggle]);

  return (
    <div
      className={`sticky top-0 z-10 bg-[var(--background)] rounded-t-2xl border-b border-[var(--accent)]/20 p-3 ${className}`}
    >
      <button
        onClick={toggle}
        className="w-full p-2 rounded-lg flex items-center justify-center transition-all duration-300 ease-in-out hover:bg-[var(--foreground)]/10 focus:ring-opacity-50 focus:ring-2 ring-[var(--accent)] focus:outline-none relative group"
        aria-label={
          collapsed
            ? "Expand sidebar (Ctrl + /)"
            : "Collapse sidebar (Ctrl + \\)"
        }
        title={
          collapsed
            ? "Expand sidebar (Ctrl + /)"
            : "Collapse sidebar (Ctrl + \\)"
        }
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}

        {showKeyboardHints && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            {collapsed ? "Ctrl + /" : "Ctrl + \\"}
          </div>
        )}
      </button>
    </div>
  );
};

export default SidebarToggle;
