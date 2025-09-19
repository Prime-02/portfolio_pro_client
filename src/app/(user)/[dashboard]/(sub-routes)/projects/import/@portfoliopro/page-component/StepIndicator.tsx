import React from "react";
import { CheckCircle } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  projectId: string;
  collaboratorCount: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  projectId,
  collaboratorCount = 0,
}) => {
  return (
    <div className="flex items-center flex-wrap min-w-sm gap-4 mb-6">
      {/* Step 1: Basic Info */}
      <div className="flex items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= 1
              ? "bg-[var(--accent)] text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {currentStep > 1 ? <CheckCircle size={16} /> : "1"}
        </div>
        <span className="ml-2 text-sm font-medium">{`Basic Info ${projectId ? "" : "(Required)"}`}</span>
      </div>

      {/* Connector */}
      <div className="w-8 h-[1px] bg-gray-300" />

      {/* Step 2: Details */}
      <div className="flex items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= 2
              ? "bg-[var(--accent)] text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {currentStep > 2 ? <CheckCircle size={16} /> : "2"}
        </div>
        <span className="ml-2 text-sm font-medium">{`Details ${projectId ? "" : "(Optional)"}`}</span>
      </div>

      {/* Connector */}
      <div className="w-8 h-[1px] bg-gray-300" />

      {/* Step 3: Collaborators */}
      <div className="flex items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 3
              ? "bg-[var(--accent)] text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          3
        </div>
        <span className="ml-2 text-sm font-medium">
          {`Collaborator${collaboratorCount > 1 ? `s` : ""} Details ${projectId ? "" : "(Optional)"} ${collaboratorCount > 1 ? ` [${collaboratorCount}]` : ""}`}
        </span>
      </div>
    </div>
  );
};

export default StepIndicator;
