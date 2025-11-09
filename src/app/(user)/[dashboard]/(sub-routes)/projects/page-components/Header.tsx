"use client";
import Button from "@/app/components/buttons/Buttons";
import BasicHeader from "@/app/components/containers/divs/header/BasicHeader";
import { useGlobalState } from "@/app/globalStateProvider";
import { Plug } from "lucide-react";
import React from "react";

const Header = () => {
  const { extendRoute } = useGlobalState();
  return (
    <header className="h-auto w-full  flex justify-between flex-wrap items-center gap-2 py-2">
      <BasicHeader
        heading={`Your Projects`}
        headingClass="md:text-6xl text-4xl font-bold"
        subHeading={`All your projects from different platforms in one place`}
        subHeadingClass="md:text-3xl text-xl font-semibold"
      />
      <div className="flex items-center md:w-auto w-full justify-end md:justify-center gap-x-3">
        <Button
          text="Connect Platform"
          onClick={() => {
            extendRoute("/connect");
          }}
          size="sm"
          icon={<Plug />}
        />
      </div>
    </header>
  );
};

export default Header;
