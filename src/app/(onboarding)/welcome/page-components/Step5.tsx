import ThemeControlPanel from "@/app/(user)/[dashboard]/(sub-routes)/preference/ThemeControlPanel";
import Button from "@/app/components/buttons/Buttons";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { useGlobalState } from "@/app/globalStateProvider";
import { ArrowLeft, ArrowRight } from "lucide-react";
import React from "react";

const Step5 = () => {
  const { extendRouteWithQuery } = useGlobalState();
  const { saveChanges } = useTheme();
  return (
    <ThemeControlPanel
      component={
        <div className="flex gap-x-2">

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              saveChanges();
              extendRouteWithQuery({ step: "4" });
            }}
            text="Back"
            icon={<ArrowLeft size={14} />}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              saveChanges();
              extendRouteWithQuery({ step: "6" });
            }}
            text="Finish Up"
            icon2={<ArrowRight size={14} />}
          />
        </div>
      }
    />
  );
};

export default Step5;
