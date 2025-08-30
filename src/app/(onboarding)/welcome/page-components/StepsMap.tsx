import SidebarToggle from "@/app/components/buttons/CollapseButton";
import { onboardingSteps } from "@/app/components/utilities/indices/MultiStepWriteUp";
import { useGlobalState } from "@/app/globalStateProvider";
import { ChevronLeft, ChevronRight, Check, Circle } from "lucide-react";
import React, { useState, useEffect } from "react";
import { IconType } from "react-icons";

// Define types for onboarding steps
interface OnboardingStep {
  step: string;
  title: string;
  description: string;
  icons?: { icon: IconType; label: string }[];
}

const Sidebar: React.FC = () => {
  const { extendRouteWithQuery, searchParams } = useGlobalState();

  // Initialize with SSR-safe defaults
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [currentStep, setCurrentStep] = useState("0");
  const [isClient, setIsClient] = useState(false);

  // Mark when component is mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle responsive behavior safely for SSR
  useEffect(() => {
    if (!isClient) return;

    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 768);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isClient]);

  // Sync currentStep with searchParams only on client
  useEffect(() => {
    if (!isClient) return;

    const step = searchParams.get("step") || "0";
    setCurrentStep(step);
  }, [searchParams, isClient]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleStepClick = (step: OnboardingStep) => {
    setCurrentStep(step.step);
    extendRouteWithQuery({ step: step.step });
  };

  const getStepStatus = (
    stepNumber: string
  ): "completed" | "current" | "upcoming" => {
    const current = parseInt(currentStep);
    const step = parseInt(stepNumber);

    if (isNaN(current) || isNaN(step)) return "upcoming";
    if (step < current) return "completed";
    if (step === current) return "current";
    return "upcoming";
  };

  // Create a deterministic icon selection to avoid hydration mismatches
  const getDeterministicIcon = (
    icons?: { icon: IconType }[],
    stepNumber?: string
  ): IconType => {
    if (!icons || icons.length === 0) return Circle;

    // Use step number as seed for consistent selection
    const seed = stepNumber ? parseInt(stepNumber) || 0 : 0;
    const index = seed % Math.min(4, icons.length);
    return icons[index]?.icon || Circle;
  };

  // Don't render responsive behavior until client-side
  if (!isClient) {
    return (
      <div className="flex h-auto min-h-screen p-4 relative">
        <div className="h-full rounded-2xl border border-[var(--accent)]/20 transition-all duration-300 ease-in-out w-80 md:w-80 md:flex-shrink-0 relative">
          <div className="p-4">
            <div className="space-y-4">
              {onboardingSteps.map((step: OnboardingStep, index: number) => {
                const status = getStepStatus(step.step);
                const IconComponent = getDeterministicIcon(
                  step.icons,
                  step.step
                );
                const isLast = index === onboardingSteps.length - 1;

                return (
                  <div key={step.step} className="relative">
                    {!isLast && (
                      <div
                        className={`absolute bg-[var(--accent)] left-9 top-12 w-0.5 h-16`}
                      ></div>
                    )}

                    <div
                      onClick={() => handleStepClick(step)}
                      className={`flex items-center  rounded-xl space-x-4 p-3 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                        status === "current"
                          ? "bg-[var(--foreground)] border border-[var(--accent)]/20"
                          : ""
                      }`}
                    >
                      <div className="relative flex-shrink-0 flex items-center justify-center">
                        <div
                          className={`rounded-full flex items-center justify-center text-sm font-semibold transition-all w-12 h-12 ${
                            status === "completed"
                              ? "bg-[var(--accent)]"
                              : status === "current"
                                ? "bg-[var(--background)]"
                                : "bg-[var(--background)]"
                          }`}
                        >
                          {status === "completed" ? (
                            <Check size={16} />
                          ) : (
                            <IconComponent size={16} />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-medium text-sm mb-1 ${
                            status === "current"
                              ? "text-[var(--background)]"
                              : "text-[var(--foreground)]"
                          }`}
                        >
                          {step.title}
                        </h3>
                        <p
                          className={`text-xs ${
                            status === "current"
                              ? "text-[var(--background)]"
                              : "text-[var(--foreground)]"
                          } opacity-65 mb-2 leading-relaxed`}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-auto min-h-screen p-4 relative">
      <div
        className={`h-full rounded-2xl border border-[var(--accent)]/20 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-16" : "w-80"
        } md:${isCollapsed ? "w-16" : "w-80"} md:flex-shrink-0 relative`}
      >
        {/* Collapse Button - Fixed at top */}
        <SidebarToggle onToggle={toggleSidebar} isCollapsed={isCollapsed} />

        <div className="p-4">
          <div className="space-y-4">
            {onboardingSteps.map((step: OnboardingStep, index: number) => {
              const status = getStepStatus(step.step);
              const IconComponent = getDeterministicIcon(step.icons, step.step);
              const isLast = index === onboardingSteps.length - 1;

              return (
                <div key={step.step} className="relative">
                  {!isLast && !isCollapsed && (
                    <div className="absolute left-9 top-12 w-0.5 h-16 bg-[var(--accent)]"></div>
                  )}

                  <div
                    onClick={() => handleStepClick(step)}
                    className={`flex items-center ${
                      isCollapsed
                        ? "justify-center rounded-full"
                        : "items-start rounded-xl space-x-4 p-3"
                    } cursor-pointer transition-all duration-200 hover:shadow-sm ${
                      status === "current"
                        ? "bg-[var(--foreground)] border border-[var(--accent)]"
                        : ""
                    }`}
                  >
                    <div
                      className={`relative flex-shrink-0 flex items-center justify-center ${
                        isCollapsed ? "w-full" : ""
                      }`}
                    >
                      <div
                        className={`rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                          isCollapsed ? "w-8 h-8" : "w-12 h-12"
                        } ${
                          status === "completed"
                            ? "bg-[var(--accent)]"
                            : status === "current"
                              ? "bg-[var(--background)]"
                              : "bg-[var(--background)]"
                        }`}
                      >
                        {status === "completed" ? (
                          <Check size={isCollapsed ? 12 : 16} />
                        ) : (
                          <IconComponent size={isCollapsed ? 12 : 16} />
                        )}
                      </div>
                    </div>

                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-medium text-sm mb-1 ${
                            status === "current"
                              ? "text-[var(--background)]"
                              : "text-[var(--foreground)]"
                          }`}
                        >
                          {step.title}
                        </h3>
                        <p
                          className={`text-xs ${
                            status === "current"
                              ? "text-[var(--background)]"
                              : "text-[var(--foreground)]"
                          } opacity-65 mb-2 leading-relaxed`}
                        >
                          {step.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
