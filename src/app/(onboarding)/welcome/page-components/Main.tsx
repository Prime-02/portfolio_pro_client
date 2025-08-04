import { useGlobalState } from "@/app/globalStateProvider";
import React from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import Step0 from "./Step0";
import Step6 from "./Step6";

const Main = () => {
  const { searchParams } = useGlobalState();
  const currentStep = searchParams.get("step");

  const renderStep = () => {
    switch (currentStep) {
      case "0":
        return <Step0 />;
      case "1":
        return <Step1 />;
      case "2":
        return <Step2 />;
      case "3":
        return <Step3 />;
      case "4":
        return <Step4 />;
      case "5":
        return <Step5 />;
      case "6":
        return <Step6 />;
      default:
        return <Step0 />;
    }
  };

  return (
    <div>
      <div>{renderStep()}</div>
    </div>
  );
};

export default Main;
