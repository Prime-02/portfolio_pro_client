import React from "react";
import { CheckCircle } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center gap-4 mb-6">
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
        <span className="ml-2 text-sm font-medium">Basic Info (Required)</span>
      </div>
      <div className="w-8 h-[1px] bg-gray-300" />
      <div className="flex items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 2
              ? "bg-[var(--accent)] text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          2
        </div>
        <span className="ml-2 text-sm font-medium">Details (Optional)</span>
      </div>
    </div>
  );
};

export default StepIndicator;