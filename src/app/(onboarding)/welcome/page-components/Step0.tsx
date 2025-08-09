import React, { useState } from "react";
import TemplateStructure, { ComponentArrangement } from "./TemplateStructure";
import { gettingStarted } from "@/app/components/utilities/indices/MultiStepWriteUp";
import Image from "next/image";
import { useGlobalState } from "@/app/globalStateProvider";
import Button from "@/app/components/buttons/Buttons";
import { ChevronRight } from "lucide-react";
import { toast } from "@/app/components/toastify/Toastify";

const Step0 = () => {
  const { userData, router, extendRouteWithQuery } = useGlobalState();
  const [currentArrangement, setCurrentArrangement] =
    useState<ComponentArrangement>("A-C-B-D");

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    if (userData.username) {
      router.push(`/${userData.username}`);
    } else {
      toast.warning("A username is required to proceed", {
        title: "Warning",
        action: {
          label: "Sign Up",
          onClick: () => router.push("/user-auth?auth_mode=signup"),
        },
      });
    }
  };

  return (
    <TemplateStructure
      headerAlignment="left"
      step={gettingStarted.step + "/6"}
      headerDescription={gettingStarted.description}
      greeting={gettingStarted.greeting}
      pageWriteup={gettingStarted.page_writeup}
      onBack={handleBack}
      onSkip={handleSkip}
      additionalContent={
        <div className="h-full w-full">
          <Image
            alt="Step 4"
            src={"/vectors/undraw_hello_ccwj.svg"}
            width={1000}
            height={1000}
          />
        </div>
      }
      onArrangementChange={(newArrangement) => {
        console.log(newArrangement);
        setCurrentArrangement(newArrangement); // Update the state
      }}
      arrangement={currentArrangement}
      title={gettingStarted.title}
    >
      <div className="flex flex-col w-full h-auto">
        <Button
          onClick={() => {
            extendRouteWithQuery({ step: "1" });
          }}
          text="Get Started"
          icon2={<ChevronRight />}
        />
      </div>
    </TemplateStructure>
  );
};

export default Step0;
