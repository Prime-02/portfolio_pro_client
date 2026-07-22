import React, { useState } from "react";
import TemplateStructure, { ComponentArrangement } from "./TemplateStructure";
import { useRouting } from "@/lib/hooks/routing/useRouting";
import { useUserStore } from "@/lib/stores/user/userStore";
import { toast } from "@/src/context/Toastify";
import { gettingStarted } from "@/lib/utilities/indices/MultiStepWriteUp";
import Image from "@/src/app/components/ui/Image";
import Button from "@/src/app/components/buttons/Buttons";
import { ChevronRight } from "lucide-react";


const Step0 = () => {
  const { router, extendRouteWithQuery } = useRouting();
  const { userData } = useUserStore()
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
      step={String(gettingStarted.step)}
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
