import Button from "@/app/components/buttons/Buttons";
import { useGlobalState } from "@/app/globalStateProvider";
import { Plus } from "lucide-react";
import React from "react";

const SkillsDisplay = () => {
  const { extendRouteWithQuery } = useGlobalState();
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold">
            {`Skills & Expertise`}
          </h2>
          <p className="opacity-70 mt-2">
            {`Demonstrate your capabilities through proven results and measurable impact.`}
          </p>
        </div>
        <Button
          icon={<Plus />}
          variant="ghost"
          className="self-end sm:self-auto"
          onClick={() => {
            extendRouteWithQuery({ create: "true" });
          }}
        />
      </div>
    </div>
  );
};

export default SkillsDisplay;



