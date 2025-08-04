import React, { useState } from "react";
import TemplateStructure, { ComponentArrangement } from "./TemplateStructure";
import { completionMessage } from "@/app/components/utilities/indices/MultiStepWriteUp";
import Image from "next/image";
import { useGlobalState } from "@/app/globalStateProvider";
import { toast } from "@/app/components/toastify/Toastify";
import Button from "@/app/components/buttons/Buttons";
import { ArrowRight, ChevronRight, Share2 } from "lucide-react";
import {
  copyToClipboard,
  getCurrentUrl,
} from "@/app/components/utilities/syncFunctions/syncs";
import Link from "next/link";

const Step6 = () => {
  const { userData, router, extendRouteWithQuery } = useGlobalState();
  const [currentArrangement, setCurrentArrangement] =
    useState<ComponentArrangement>("A-D-B-C");

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
      step={completionMessage.step + "/6"}
      headerDescription={completionMessage.description}
      greeting={completionMessage.greeting}
      pageWriteup={completionMessage.page_writeup}
      onBack={handleBack}
      onSkip={handleSkip}
      additionalContent={
        <div className="h-full w-full">
          <Image
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
        />
        <div className="flex md:flex-row gap-1 justify-between items-center ">
          <span className="min-w-1/2 flex">
            <Button
              size="md"
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
                  `${getCurrentUrl("origin")}/${userData.username}`
                );
              }}
              className="w-full"
              icon={<Share2 size={16} />}
            />
          </span>
          <Link
            href={`/${userData.username || "dashboard"}`}
            className="min-w-1/2 flex"
          >
            <Button
              onClick={() => {
                extendRouteWithQuery({ step: "1" });
              }}
              className="w-full"
              size="md"
              variant="outline"
              text={completionMessage.cta.secondary}
              icon2={<ArrowRight size={16} />}
            />
          </Link>
        </div>
      </div>
    </TemplateStructure>
  );
};

export default Step6;
