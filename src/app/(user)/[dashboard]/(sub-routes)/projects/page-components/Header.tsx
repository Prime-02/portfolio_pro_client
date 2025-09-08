"use client";
import Button from "@/app/components/buttons/Buttons";
import { useGlobalState } from "@/app/globalStateProvider";
import { Plug, Plus } from "lucide-react";
import React from "react";

const Header = () => {
  const { extendRoute } = useGlobalState();
  return (
    <header className="h-auto w-full  flex justify-between flex-wrap items-center gap-2 py-2 px-2 md:px-4">
      <div className="flex flex-col gap-y-2 items-start ">
        <h1 className="md:text-3xl text-2xl  ">Your Projects</h1>
        <h3 className="md:text-base text-sm w-xs md:w-lg opacity-65 font-thin">
          All your projects from different platforms in one place
        </h3>
      </div>
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
