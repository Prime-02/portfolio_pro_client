import { useTheme } from "@/app/components/theme/ThemeContext ";
import { onboardingSteps } from "@/app/components/utilities/indices/MultiStepWriteUp";
import { getColorShade } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import { ChevronLeft, ChevronRight, Check, Circle } from "lucide-react";
import React, { useState, useEffect } from "react";

const Sidebar = () => {
  const { extendRouteWithQuery, searchParams } = useGlobalState();
  const { theme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentStep, setCurrentStep] = useState(
    searchParams.get("step") || "1"
  );

  useEffect(() => {
    // Only run this effect on client side
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 768);
    };
    // Set initial state
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const step = searchParams.get("step") || "1";
    setCurrentStep(step);
  }, [searchParams]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleStepClick = (step) => {
    setCurrentStep(String(step.step));
    extendRouteWithQuery({ step: String(step.step) });
  };

  const getStepStatus = (stepNumber) => {
    const current = parseInt(currentStep);
    const step = parseInt(stepNumber);
    
    if (step < current) return 'completed';
    if (step === current) return 'current';
    return 'upcoming';
  };

  const getRandomIcon = (icons) => {
    if (!icons || icons.length === 0) return Circle;
    const randomIndex = Math.floor(Math.random() * Math.min(4, icons.length));
    return icons[randomIndex]?.icon || Circle;
  };

  return (
    <div className="flex h-auto min-h-screen p-4">
      <div
        style={{
          backgroundColor: getColorShade(theme?.background, 10),
        }}
        className={`h-full rounded-2xl transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-16" : "w-80"
        } md:${isCollapsed ? "w-16" : "w-80"} md:flex-shrink-0 relative`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">Z</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Ziemann</h2>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none transition-colors"
          >
            {!isCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Steps */}
        <div className="p-4">
          <div className="space-y-4">
            {onboardingSteps.map((step, index) => {
              const status = getStepStatus(step.step);
              const IconComponent = getRandomIcon(step.icons);
              const isLast = index === onboardingSteps.length - 1;

              return (
                <div key={step.step} className="relative">
                  {/* Connecting Line */}
                  {!isLast && !isCollapsed && (
                    <div 
                      className={`absolute left-6 top-12 w-0.5 h-16 ${
                        status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  )}
                  
                  {/* Step Container */}
                  <div
                    onClick={() => handleStepClick(step)}
                    className={`flex items-start space-x-4 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-sm ${
                      status === 'current' ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  >
                    {/* Step Icon/Number */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                          status === 'completed'
                            ? 'bg-green-500 text-white'
                            : status === 'current'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {status === 'completed' ? (
                          <Check size={16} />
                        ) : !isCollapsed ? (
                          step.step
                        ) : (
                          <IconComponent size={16} />
                        )}
                      </div>
                    </div>

                    {/* Step Content */}
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium text-sm mb-1 ${
                          status === 'current' ? 'text-blue-700' : 'text-gray-800'
                        }`}>
                          {step.title}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                          {step.description}
                        </p>
                        
                        {/* Step Icon */}
                        <div className="flex items-center">
                          <div className={`p-1.5 rounded-md ${
                            status === 'current' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <IconComponent 
                              size={14} 
                              className={
                                status === 'current' ? 'text-blue-600' : 'text-gray-500'
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Summary */}
        {!isCollapsed && (
          <div className="absolute bottom-6 left-4 right-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-800">
                  {Math.max(0, parseInt(currentStep) - 1)}/{onboardingSteps.length}
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(Math.max(0, parseInt(currentStep) - 1) / onboardingSteps.length) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default Sidebar;