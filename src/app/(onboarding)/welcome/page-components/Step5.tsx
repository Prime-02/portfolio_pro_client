import { useRouting } from "@/lib/hooks/routing/useRouting";
import ThemeControlPanel from "@/src/app/(user)/[dashboard]/(sub-routes)/preference/ThemeControlPanel";
import Button from "@/src/app/components/buttons/Buttons";
import { ArrowLeft, ArrowRight } from "lucide-react";
import React from "react";

const Step5 = () => {
  const { extendRouteWithQuery } = useRouting();
  return (
    <ThemeControlPanel
      component={
        <div className="flex gap-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              extendRouteWithQuery({ step: "4" });
            }}
            text="Back"
            icon={<ArrowLeft size={14} />}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
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
