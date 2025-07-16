"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useTheme } from "../../theme/ThemeContext ";
import { getColorShade } from "../../utilities/syncFunctions/syncs";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
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
  springConfig = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  },
}) => {
  const { theme } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle body scroll prevention
  useEffect(() => {
    if (typeof window === "undefined" || !preventScroll || !isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, preventScroll]);

  // Handle escape key
  useEffect(() => {
    if (typeof window === "undefined" || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle focus trap
  useEffect(() => {
    if (typeof window === "undefined" || !isOpen) return;

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
    firstElement?.focus();

    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

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
              relative  w-full ${sizeClasses[size]} 
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
                  <motion.h2
                    className="text-xl font-semibold  truncate pr-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                  >
                    {title}
                  </motion.h2>
                )}
                {showCloseButton && (
                  <motion.button
                    onClick={onClose}
                    className="flex-shrink-0 p-2  hover:text-[var(--accent)] hover:bg-[var(--foreground)] rounded-full transition-colors duration-150"
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

  // Render to portal
  if (typeof window === "undefined") {
    return null;
  }

  return createPortal(modalContent, document.body);
};

export default Modal;

// Enhanced usage example with multiple modal types
export const ModalExample: React.FC = () => {
  const [basicModal, setBasicModal] = React.useState(false);
  const [centeredModal, setCenteredModal] = React.useState(false);
  const [fullModal, setFullModal] = React.useState(false);
  const [customModal, setCustomModal] = React.useState(false);

  return (
    <div className="p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold  mb-2">
          Sophisticated Modal with Framer Motion
        </h1>
        <p className=" mb-6">
          Experience buttery smooth animations powered by Framer Motion
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.button
          onClick={() => setBasicModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Basic Slide-up Modal
        </motion.button>

        <motion.button
          onClick={() => setCenteredModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Centered Modal
        </motion.button>

        <motion.button
          onClick={() => setFullModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Full Width Modal
        </motion.button>

        <motion.button
          onClick={() => setCustomModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Custom Animation
        </motion.button>
      </motion.div>

      <motion.div
        className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h3 className="font-bold text-lg mb-3 ">✨ Framer Motion Features:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm ">
          <div className="flex items-center space-x-2">
            <span className="text-green-500">•</span>
            <span>Spring physics animations</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">•</span>
            <span>Smooth slide-up transitions</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">•</span>
            <span>Backdrop blur animations</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">•</span>
            <span>Staggered content reveals</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">•</span>
            <span>Interactive button animations</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">•</span>
            <span>Customizable spring configs</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">•</span>
            <span>AnimatePresence for smooth exits</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">•</span>
            <span>Performance optimized</span>
          </div>
        </div>
      </motion.div>

      {/* Basic Modal */}
      <Modal
        isOpen={basicModal}
        onClose={() => setBasicModal(false)}
        title="Basic Slide-up Modal"
        size="md"
      >
        <div className="space-y-4">
          <p className="">
            This modal slides up from the bottom with smooth Framer Motion
            animations. The height automatically adjusts to fit the content.
          </p>
          <div className="flex gap-2"></div>
        </div>
      </Modal>

      {/* Centered Modal */}
      <Modal
        isOpen={centeredModal}
        onClose={() => setCenteredModal(false)}
        title="Centered Modal"
        size="lg"
        centered={true}
      >
        <div className="space-y-4">
          <p className="">
            This modal appears in the center of the screen with a scale and fade
            animation. Perfect for important confirmations or focused content.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900">Feature 1</h4>
              <p className="text-sm text-blue-700">Description here</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900">Feature 2</h4>
              <p className="text-sm text-green-700">Description here</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCenteredModal(false)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </Modal>

      {/* Full Width Modal */}
      <Modal
        isOpen={fullModal}
        onClose={() => setFullModal(false)}
        title="Full Width Modal"
        size="full"
      >
        <div className="space-y-6">
          <p className="">
            This modal takes up the full width of the screen, great for forms or
            detailed content.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold">Column {i}</h4>
                <p className="text-sm ">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFullModal(false)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Custom Animation Modal */}
      <Modal
        isOpen={customModal}
        onClose={() => setCustomModal(false)}
        title="Custom Spring Animation"
        size="md"
        springConfig={{
          type: "spring",
          stiffness: 200,
          damping: 25,
          mass: 1.2,
        }}
      >
        <div className="space-y-4">
          <p className="">
            This modal uses custom spring configuration for a more bouncy,
            playful animation. You can customize stiffness, damping, and mass
            values.
          </p>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800">Custom Springs</h4>
            <p className="text-sm text-yellow-700">
              Stiffness: 200, Damping: 25, Mass: 1.2
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCustomModal(false)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
