"use client";

import Modal from "@/app/components/containers/modals/Modal";
import { useGlobalState } from "@/app/globalStateProvider";
import React from "react";

const page = () => {
  const { router } = useGlobalState();

  const ModalHeader = () => {
    return (
      <div className="flex flex-col gap-y-2 items-start ">
        <h1 className="md:text-3xl text-2xl  ">{`Available Platform`}</h1>
        <h3 className="md:text-base text-sm w-xs md:w-lg opacity-65 font-thin">
          {`Connect your professional platforms to automatically sync projects
            and streamline your workflow`}
        </h3>
      </div>
    );
  };
  return (
    <Modal
      size="auto"
      title={<ModalHeader />}
      isOpen
      onClose={() => {
        router.back();
      }}
    ></Modal>
  );
};

export default page;
