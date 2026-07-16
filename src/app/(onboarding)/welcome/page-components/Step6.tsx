import React, { useState } from "react";
import TemplateStructure, { ComponentArrangement } from "./TemplateStructure";
import { useRouting } from "@/lib/hooks/routing/useRouting";
import { useUserStore } from "@/lib/stores/user/userStore";
import { toast } from "@/src/app/components/toastify/Toastify";
import { completionMessage } from "@/lib/utilities/indices/MultiStepWriteUp";
import Image from "next/image";
import Button from "@/src/app/components/buttons/Buttons";
import { ArrowRight, Share2 } from "lucide-react";
import { copyToClipboard, getCurrentUrl } from "@/lib/utilities/syncFunctions/syncs";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

const Step6 = () => {
  const { router, extendRouteWithQuery } = useRouting();
  const { userInfo, isLoading } = useUserSettings()
  const [currentArrangement, setCurrentArrangement] =
    useState<ComponentArrangement>("A-D-B-C");

  const isDisabled = !userInfo?.username || isLoading;

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    if (userInfo?.username) {
      router.push(`/${userInfo?.username}`);
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

  const handleBuildPortfolio = () => {
    if (!isDisabled) {
      router.push(`/${userInfo?.username || "dashboard"}/portfolios`);
    }
  };

  const handleGoToDashboard = () => {
    if (!isDisabled) {
      extendRouteWithQuery({ step: "1" });
    }
  };

  return (
    <TemplateStructure
      headerAlignment="left"
      step={String(completionMessage.step)}
      headerDescription={completionMessage.description}
      greeting={completionMessage.greeting}
      pageWriteup={completionMessage.page_writeup}
      onBack={handleBack}
      onSkip={handleSkip}
      additionalContent={
        <div className="h-full w-full">
          <img
            alt="Step 4"
            src={"/vectors/undraw_order-confirmed_m9e9.svg"}
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
      title={completionMessage.title}
    >
      <div className="flex flex-col gap-y-3 w-full h-auto">
        <Button
          className="w-full"
          size="md"
          variant="primary"
          text="Build Your First Portfolio"
          icon2={<ArrowRight size={16} />}
          onClick={handleBuildPortfolio}
          disabled={isDisabled}
        />
        <div className="flex md:flex-row gap-1 justify-between items-center ">
          <span className="min-w-1/2 flex">
            <Button
              size="sm"
              variant="outline"
              text={completionMessage.cta.primary}
              onClick={() => {
                if (window === undefined) {
                  toast.error("Something went wrong please  try again", {
                    title: "Error copying text",
                  });
                  return;
                }
                copyToClipboard(
                  `${getCurrentUrl("origin")}/${userInfo?.username}`
                );
              }}
              className="w-full"
              icon={<Share2 size={16} />}
              disabled={isDisabled}
            />
          </span>
          <Button
            onClick={handleGoToDashboard}
            className="min-w-1/2 flex w-full"
            size="sm"
            variant="outline"
            text={completionMessage.cta.secondary}
            icon2={<ArrowRight size={16} />}
            disabled={isDisabled}
          />
        </div>
      </div>
    </TemplateStructure>
  );
};

export default Step6;