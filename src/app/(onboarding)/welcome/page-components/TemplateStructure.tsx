import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/app/components/buttons/Buttons";
import { ChevronLeft, ChevronRight, Grid3X3 } from "lucide-react";
import Modal from "@/app/components/containers/modals/Modal";
import PortfolioPro from "@/app/components/logo/PortfolioProTextLogo";

export type ComponentArrangement =
  | "A-D-B-C" // A and D on top row, B and C on bottom row
  | "A-D-C-B" // A and D on top row, C and B on bottom row
  | "A-B-D-C" // A and B on top row, D and C on bottom row
  | "A-B-C-D" // A and B on top row, C and D on bottom row
  | "A-C-D-B" // A and C on top row, D and B on bottom row
  | "A-C-B-D" // A and C on top row, B and D on bottom row
  | "D-A-B-C" // D and A on top row, B and C on bottom row
  | "D-A-C-B" // D and A on top row, C and B on bottom row
  | "D-B-A-C" // D and B on top row, A and C on bottom row
  | "D-B-C-A" // D and B on top row, C and A on bottom row
  | "D-C-A-B" // D and C on top row, A and B on bottom row
  | "D-C-B-A" // D and C on top row, B and A on bottom row
  | "B-A-D-C" // B and A on top row, D and C on bottom row
  | "B-A-C-D" // B and A on top row, C and D on bottom row
  | "B-D-A-C" // B and D on top row, A and C on bottom row
  | "B-D-C-A" // B and D on top row, C and A on bottom row
  | "B-C-A-D" // B and C on top row, A and D on bottom row
  | "B-C-D-A" // B and C on top row, D and A on bottom row
  | "C-A-D-B" // C and A on top row, D and B on bottom row
  | "C-A-B-D" // C and A on top row, B and D on bottom row
  | "C-D-A-B" // C and D on top row, A and B on bottom row
  | "C-D-B-A" // C and D on top row, B and A on bottom row
  | "C-B-A-D" // C and B on top row, A and D on bottom row
  | "C-B-D-A"; // C and B on top row, D and A on bottom row

type ComponentType = "A" | "B" | "C" | "D";
type PositionType = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

type TemplateStructureProps = {
  // Header (A) Props
  step: string; // e.g., "2/5"
  title: string; // e.g., "Professional Details"
  headerDescription: string; // e.g., "Tell us about your career"
  headerAlignment?: "left" | "right"; // Alignment for header when it is the top component

  // Description (B) Props
  greeting: string; // e.g., "Welcome!"
  pageWriteup: string; // e.g., "Fill in your professional details..."

  // Form (C) Props
  children: React.ReactNode; // Form content

  // Additional Component (D) Props
  additionalContent?: React.ReactNode; // Optional component

  // Optional
  onBack?: () => void;
  onSkip?: () => void;
  arrangement?: ComponentArrangement;
  onArrangementChange?: (arrangement: ComponentArrangement) => void;

  // Focus and scroll props
  focusedComponent?: ComponentType; // Which component should be focused
  scrollBehavior?: ScrollBehavior; // 'auto' | 'smooth'
  scrollIntoViewOptions?: ScrollIntoViewOptions; // Additional scroll options
};

const TemplateStructure = ({
  step,
  title,
  headerDescription,
  headerAlignment = "right", // Default to right alignment for header
  greeting,
  pageWriteup,
  children,
  additionalContent,
  onBack,
  onSkip,
  arrangement = "A-D-B-C", // Default arrangement
  onArrangementChange,
  focusedComponent = "C",
  scrollBehavior = "smooth",
  scrollIntoViewOptions = {
    behavior: "smooth",
    block: "center",
    inline: "nearest",
  },
}: TemplateStructureProps) => {
  const [hoveredSection, setHoveredSection] = useState<ComponentType | null>(
    null
  );
  const [showLayoutSelector, setShowLayoutSelector] =
    useState<ComponentType | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Refs for each component to handle scrolling
  const componentRefs = useRef<Record<ComponentType, HTMLDivElement | null>>({
    A: null,
    B: null,
    C: null,
    D: null,
  });

  // Handle scrolling to focused component
  useEffect(() => {
    if (
      focusedComponent &&
      componentRefs.current[focusedComponent] &&
      hasAnimated
    ) {
      const element = componentRefs.current[focusedComponent];

      // Check if element is in viewport
      const rect = element.getBoundingClientRect();
      const isInViewport =
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <=
          (window.innerWidth || document.documentElement.clientWidth);

      // Only scroll if element is not fully visible and initial animations are complete
      if (!isInViewport) {
        // Add a delay to ensure layout animations have completed
        const scrollTimer = setTimeout(() => {
          element.scrollIntoView({
            behavior: scrollBehavior,
            ...scrollIntoViewOptions,
          });
        }, 700); // Wait for layout animations to complete

        return () => clearTimeout(scrollTimer);
      }
    }
  }, [
    focusedComponent,
    arrangement,
    scrollBehavior,
    scrollIntoViewOptions,
    hasAnimated,
  ]);

  // Get all possible arrangements for a given component as first
  const getArrangementsWithComponentFirst = (
    component: ComponentType
  ): ComponentArrangement[] => {
    const allArrangements: ComponentArrangement[] = [
      "A-D-B-C",
      "A-D-C-B",
      "A-B-D-C",
      "A-B-C-D",
      "A-C-D-B",
      "A-C-B-D",
      "D-A-B-C",
      "D-A-C-B",
      "D-B-A-C",
      "D-B-C-A",
      "D-C-A-B",
      "D-C-B-A",
      "B-A-D-C",
      "B-A-C-D",
      "B-D-A-C",
      "B-D-C-A",
      "B-C-A-D",
      "B-C-D-A",
      "C-A-D-B",
      "C-A-B-D",
      "C-D-A-B",
      "C-D-B-A",
      "C-B-A-D",
      "C-B-D-A",
    ];

    return allArrangements
      .filter((arr) => arr.startsWith(component))
      .slice(0, 6);
  };

  // Define components (A, B, C, D)
  const components: Record<ComponentType, React.ReactNode> = {
    A: (
      <div
        className={`w-full flex items-center ${headerAlignment === "left" ? "justify-start" : "justify-end"}`}
      >
        <span
          className={`flex flex-col ${headerAlignment === "left" ? "justify-start text-left" : "justify-start text-right"}`}
        >
          <p className="text-sm opacity-65">Step {step}</p>
          <PortfolioPro
            tracking={0.1}
            fontWeight={"bold"}
            fullText={title}
            scale={1}
          />
          <h3 className="text-sm opacity-65">{headerDescription}</h3>
        </span>
      </div>
    ),
    B: (
      <div className="md:flex max-w-sm flex-col gap-y-3 hidden">
        <h3 className="font-semibold">{greeting}</h3>
        <div className="font-thin opacity-70 text-sm">{pageWriteup}</div>
      </div>
    ),
    C: (
      <div className="w-full md:w-md flex flex-col gap-y-4 p-4 ">
        {children}
      </div>
    ),
    D: additionalContent ? (
      <div className="w-full md:max-w-sm flex flex-col gap-y-3">
        {additionalContent}
      </div>
    ) : (
      <div className="w-full md:max-w-sm"></div> // Empty placeholder if no additional content
    ),
  };

  // Parse arrangement (e.g., "A-D-B-C" → ["A", "D", "B", "C"])
  const [topLeft, topRight, bottomLeft, bottomRight] = arrangement.split(
    "-"
  ) as [ComponentType, ComponentType, ComponentType, ComponentType];

  // Helper function to get responsive classes for components
  const getComponentClasses = (position: PositionType) => {
    const baseClasses = "w-full";
    return `${baseClasses} md:w-1/2`;
  };

  // Get layout key for position-based animations
  const getLayoutId = (component: ComponentType) => `component-${component}`;

  // Handle layout change
  const handleLayoutChange = (newArrangement: ComponentArrangement) => {
    if (onArrangementChange) {
      onArrangementChange(newArrangement);
    }
    setShowLayoutSelector(null);
  };

  // Render layout selector
  const renderLayoutSelector = (component: ComponentType) => {
    const arrangements = getArrangementsWithComponentFirst(component);

    return (
      <div className="rounded-lg p-6 max-w-md w-full">
        <div className="grid grid-cols-2 gap-3">
          {arrangements.map((arr, index) => (
            <button
              key={index}
              onClick={() => handleLayoutChange(arr)}
              className={`p-3 border rounded-lg hover:bg-[var(--background)] transition-colors text-sm ${
                arr === arrangement
                  ? "border-[var(--accent)]"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="grid grid-cols-2 gap-1 mb-2">
                {arr.split("-").map((comp, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded border text-xs flex items-center justify-center ${
                      comp === component
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--background)]"
                    }`}
                  >
                    {comp}
                  </div>
                ))}
              </div>
              <div className="text-xs opacity-70">{arr}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Get initial animation for first mount based on component identity
  const getInitialAnimationForComponent = (component: ComponentType) => {
    switch (component) {
      case "A":
        return { opacity: 0, x: -50, y: -50 };
      case "B":
        return { opacity: 0, x: -50, y: 50 };
      case "C":
        return { opacity: 0, x: 50, y: 50 };
      case "D":
        return { opacity: 0, x: 50, y: -50 };
    }
  };

  const getAnimationDelayForComponent = (component: ComponentType) => {
    switch (component) {
      case "A":
        return 0.1;
      case "B":
        return 0.3;
      case "C":
        return 0.4;
      case "D":
        return 0.2;
    }
  };

  // Render section with hover effect and animation
  const renderSection = (component: ComponentType, position: PositionType) => (
    <motion.div
      key={component}
      layoutId={getLayoutId(component)}
      layout="position"
      ref={(el) => (componentRefs.current[component] = el)}
      initial={
        hasAnimated
          ? { opacity: 1, x: 0, y: 0 }
          : getInitialAnimationForComponent(component)
      }
      animate={{ opacity: 1, x: 0, y: 0 }}
      onAnimationComplete={() => setHasAnimated(true)}
      transition={{
        layout: {
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94],
          type: "spring",
          stiffness: 300,
          damping: 30,
        },
        opacity: hasAnimated
          ? { duration: 0 }
          : {
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: getAnimationDelayForComponent(component),
            },
        x: hasAnimated
          ? { duration: 0 }
          : {
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: getAnimationDelayForComponent(component),
            },
        y: hasAnimated
          ? { duration: 0 }
          : {
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: getAnimationDelayForComponent(component),
            },
      }}
      className={`${getComponentClasses(position)} flex items-center justify-center relative ${
        focusedComponent === component
          ? "ring-2 ring-[var(--accent)] ring-opacity-50  rounded-lg"
          : ""
      }`}
      onMouseEnter={() => setHoveredSection(component)}
      onMouseLeave={() => setHoveredSection(null)}
    >
      {components[component]}

      {/* Hover Icon */}
      <AnimatePresence>
        {hoveredSection === component && onArrangementChange && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={() => setShowLayoutSelector(component)}
            className="absolute top-2 right-2 p-2 bg-[var(--background)] cursor-pointer backdrop-blur-sm rounded-full shadow-lg  transition-colors z-10"
            title={`Change layout with ${component} first`}
          >
            <Grid3X3 size={14} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="h-auto p-4 md:p-8 flex flex-col gap-y-5 relative">
      {/* Layout Selector Modal */}
      <Modal
        centered
        isOpen={showLayoutSelector !== null}
        onClose={() => {
          setShowLayoutSelector(null);
        }}
        title={`Choose Layout (Component ${showLayoutSelector} first)`}
      >
        {showLayoutSelector && renderLayoutSelector(showLayoutSelector)}
      </Modal>

      {/* Fixed Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-auto flex items-center justify-between"
      >
        <Button
          icon={<ChevronLeft size={14} />}
          text="Back"
          onClick={onBack}
          variant="outline"
          size="sm"
        />
        <span>
          {Number(step) < 6 && (
            <Button
              icon2={<ChevronRight size={14} />}
              text="Skip"
              onClick={onSkip}
              variant="outline"
              size="sm"
            />
          )}
        </span>
      </motion.nav>

      {/* Top Row - Two Components Side by Side */}
      <motion.div
        layout
        className="flex flex-col md:flex-row gap-4 w-full items-center"
      >
        {renderSection(topLeft, "topLeft")}
        {renderSection(topRight, "topRight")}
      </motion.div>

      <motion.span
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="h-[0.2px] w-full bg-[var(--accent)] origin-left"
      />

      {/* Mobile Dropdown for Component B (only show if B is not in top row) */}
      {topLeft !== "B" && topRight !== "B" && (
        <motion.details
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="md:hidden"
        >
          <summary className="font-semibold cursor-pointer">{greeting}</summary>
          <div className="font-thin opacity-70 text-sm mt-2">{pageWriteup}</div>
        </motion.details>
      )}

      {/* Bottom Row - Two Components Side by Side */}
      <motion.div
        layout
        className="flex flex-col md:flex-row gap-4 w-full items-center"
      >
        {renderSection(bottomLeft, "bottomLeft")}
        {renderSection(bottomRight, "bottomRight")}
      </motion.div>
    </div>
  );
};

export default TemplateStructure;
