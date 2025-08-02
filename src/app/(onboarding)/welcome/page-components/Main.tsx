import { useGlobalState } from "@/app/globalStateProvider";
import React, { useEffect, useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";

type Props = {};

const Main = (props: Props) => {
  const { searchParams, extendRouteWithQuery } = useGlobalState();
  const [currentStep, setCurrentStep] = useState(
    searchParams.get("step") || "1"
  );

  useEffect(() => {
    if (!searchParams.get("step")) {
      extendRouteWithQuery({ step: "1" });
      setCurrentStep("1");
    }
  }, [searchParams, extendRouteWithQuery]);

  const renderStep = () => {
    switch (currentStep) {
      case "1":
        return <Step1 setStep={setCurrentStep} />;
      case "2":
        return <Step2 setStep={setCurrentStep} />;
      case "3":
        return <Step3 setStep={setCurrentStep} />;
      case "4":
        return <Step4 setStep={setCurrentStep} />;
      case "5":
        return <Step5 setStep={setCurrentStep} />;
      default:
        return <Step1 setStep={setCurrentStep} />;
    }
  };

  return (
    <div>
      <div>{renderStep()}</div>
    </div>
  );
};

export default Main;
