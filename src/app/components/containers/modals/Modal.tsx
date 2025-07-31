"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useTheme } from "../../theme/ThemeContext ";
import { getColorShade } from "../../utilities/syncFunctions/syncs";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string | Element;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  backdropClassName?: string;
  animationDuration?: number;
  preventScroll?: boolean;
  zIndex?: number;
  centered?: boolean;
  loading?: boolean;
  springConfig?: {
    type?: "spring" | "tween";
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = "",
  backdropClassName = "",
  animationDuration = 0.3,
  preventScroll = true,
  zIndex = 1000,
  centered = false,
  loading = false,
  springConfig = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  },
}) => {
  const { theme } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle body scroll prevention
  useEffect(() => {
    if (!isMounted || !preventScroll || !isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen, preventScroll, isMounted]);

  // Handle escape key
  useEffect(() => {
    if (!isMounted || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose, isMounted]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle focus trap
  useEffect(() => {
    if (!isMounted || !isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleTab);

    // Use setTimeout to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      firstElement?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", handleTab);
      clearTimeout(timeoutId);
    };
  }, [isOpen, isMounted]);

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full mx-4",
  };

  // Fixed Animation variants with proper typing
  const backdropVariants: Variants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: animationDuration,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: animationDuration,
        ease: "easeIn",
      },
    },
  };

  // Separate variants for centered and slide-up modals
  const centeredModalVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        ...springConfig,
        duration: springConfig.type === "tween" ? animationDuration : undefined,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: animationDuration,
        ease: "easeIn",
      },
    },
  };

  const slideUpModalVariants: Variants = {
    hidden: {
      opacity: 0,
      y: "100%",
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        ...springConfig,
        duration: springConfig.type === "tween" ? animationDuration : undefined,
      },
    },
    exit: {
      opacity: 0,
      y: "100%",
      transition: {
        duration: animationDuration,
        ease: "easeIn",
      },
    },
  };

  // Close button animation
  const closeButtonVariants: Variants = {
    rest: {
      scale: 1,
      rotate: 0,
    },
    hover: {
      scale: 1.1,
      rotate: 90,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
    tap: {
      scale: 0.9,
    },
  };

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          className={`fixed inset-0 flex ${
            centered
              ? "items-center justify-center"
              : "items-end justify-center"
          } px-4 py-4 bg-black/50 backdrop-blur-sm ${backdropClassName}`}
          style={{ zIndex }}
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            variants={centered ? centeredModalVariants : slideUpModalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              backgroundColor: getColorShade(theme.background, 10),
            }}
            className={`
              relative w-full ${sizeClasses[size]} 
              shadow-2xl
              ${centered ? "rounded-2xl" : "rounded-2xl"}
              ${className}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <motion.div
                className="flex items-center justify-between p-6 border-b border-gray-200"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                {title && (
                  <motion.div
                    className={
                      typeof title === "string"
                        ? "text-xl font-semibold truncate pr-4"
                        : undefined
                    }
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                  >
                    {title as ReactNode}
                  </motion.div>
                )}
                {showCloseButton && (
                  <motion.button
                    onClick={onClose}
                    className={`flex-shrink-0 p-2 ${loading ? "animate-spin" : ""} hover:text-[var(--accent)] hover:bg-[var(--background)] rounded-full transition-colors duration-150`}
                    aria-label="Close modal"
                    variants={closeButtonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <X />
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* Content */}
            <motion.div
              className="p-6 max-h-[calc(100vh-8rem)] overflow-y-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Only render if mounted (prevents hydration mismatch)
  if (!isMounted) {
    return null;
  }

  return createPortal(modalContent, document.body);
};

export default Modal;
