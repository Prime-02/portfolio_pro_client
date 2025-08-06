import ThemeControlPanel from "@/app/(user)/[dashboard]/(sub-routes)/preference/ThemeControlPanel";
import Button from "@/app/components/buttons/Buttons";
import { useGlobalState } from "@/app/globalStateProvider";
import { ArrowRight } from "lucide-react";
import React from "react";

const Step5 = () => {
  const { extendRouteWithQuery } = useGlobalState();
  return (
    <ThemeControlPanel
      component={
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            extendRouteWithQuery({ step: "6" });
          }}
          text="Finish Up"
          icon2={<ArrowRight size={14} />}
        />
      }
    />
  );
};

export default Step5;
