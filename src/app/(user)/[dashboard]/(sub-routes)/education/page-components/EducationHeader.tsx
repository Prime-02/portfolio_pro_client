import Button from "@/app/components/buttons/Buttons";
import BasicHeader from "@/app/components/containers/divs/header/BasicHeader";
import { useGlobalState } from "@/app/globalStateProvider";
import { Plus } from "lucide-react";
import React from "react";

const EducationHeader = () => {
  const { extendRouteWithQuery } = useGlobalState();
  return (
    <div>
      <header className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4 mb-6">
          <BasicHeader
            heading="Educations"
            headingClass="md:text-6xl text-4xl font-bold"
            subHeading={`A complete profile helps you make a stronger impression. Take a moment to add your education and certifications to showcase your full qualifications.`}
            subHeadingClass="md:text-3xl text-xl font-semibold"
          />
          <div>
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
      </header>
    </div>
  );
};

export default EducationHeader;
