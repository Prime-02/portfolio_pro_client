import { X } from "lucide-react";
import React from "react";
import { motion, Variants } from "framer-motion";

const CloseButton = ({ onClick }: { onClick: () => void }) => {
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

  return (
    <motion.button
      onClick={onClick}
      className={`flex-shrink-0 p-2 hover:text-[var(--accent)] hover:bg-[var(--background)] rounded-full transition-colors duration-150`}
      aria-label="Close modal"
      variants={closeButtonVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
    >
      <X />
    </motion.button>
  );
};

export default CloseButton;
