import React from "react";
import Button from "@/app/components/buttons/Buttons";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ComponentArrangement =
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
}: TemplateStructureProps) => {
  // Define components (A, B, C, D)
  const components = {
    A: (
      <div
        className={`w-full flex items-center ${headerAlignment === "left" ? "justify-start" : "justify-end"}`}
      >
        <span
          className={`flex flex-col ${headerAlignment === "left" ? "justify-start text-left" : "justify-start text-right"}`}
        >
          <p className="text-sm opacity-65">Step {step}</p>
          <h1 className="text-4xl md:text-6xl font-semibold">{title}</h1>
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
      <div className="w-full md:w-md flex flex-col gap-y-4 p-4">{children}</div>
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
  ) as [
    "A" | "B" | "C" | "D",
    "A" | "B" | "C" | "D",
    "A" | "B" | "C" | "D",
    "A" | "B" | "C" | "D",
  ];

  // Helper function to get responsive classes for components
  const getComponentClasses = (
    position: "topLeft" | "topRight" | "bottomLeft" | "bottomRight"
  ) => {
    const baseClasses = "w-full";

    switch (position) {
      case "topLeft":
      case "topRight":
        return `${baseClasses} md:w-1/2`;
      case "bottomLeft":
      case "bottomRight":
        return `${baseClasses} md:w-1/2`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className="h-auto p-4 md:p-8 flex flex-col gap-y-5">
      {/* Fixed Navigation */}
      <nav className="w-full h-auto flex items-center justify-between">
        <Button
          icon={<ChevronLeft size={14} />}
          text="Back"
          onClick={onBack}
          variant="outline"
          size="sm"
        />
        <Button
          icon2={<ChevronRight size={14} />}
          text="Skip"
          onClick={onSkip}
          variant="outline"
          size="sm"
        />
      </nav>

      {/* Top Row - Two Components Side by Side */}
      <div className="flex flex-col md:flex-row gap-4 w-full items-center">
        <div
          className={`${getComponentClasses("topLeft")} flex items-center justify-center`}
        >
          {components[topLeft]}
        </div>
        <div
          className={`${getComponentClasses("topRight")} flex items-center justify-center`}
        >
          {components[topRight]}
        </div>
      </div>

      <span className="h-[0.2px] w-full bg-[var(--accent)]"></span>

      {/* Mobile Dropdown for Component B (only show if B is not in top row) */}
      {topLeft !== "B" && topRight !== "B" && (
        <details className="md:hidden">
          <summary className="font-semibold cursor-pointer">{greeting}</summary>
          <div className="font-thin opacity-70 text-sm mt-2">{pageWriteup}</div>
        </details>
      )}

      {/* Bottom Row - Two Components Side by Side */}
      <div className="flex flex-col md:flex-row gap-4 w-full items-center">
        <div
          className={`${getComponentClasses("bottomLeft")} flex items-center justify-center`}
        >
          {components[bottomLeft]}
        </div>
        <div
          className={`${getComponentClasses("bottomRight")} flex items-center justify-center`}
        >
          {components[bottomRight]}
        </div>
      </div>
    </div>
  );
};

export default TemplateStructure;
