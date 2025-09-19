"use client";

import Modal from "@/app/components/containers/modals/Modal";
import { useGlobalState } from "@/app/globalStateProvider";
import React from "react";
import AvailablePlatforms from "../../(connect)/connection-components/AvailablePlatforms";

const PlatformConnectionPersistentModalPage = () => {
  const { router, currentPath } = useGlobalState();

  return (
    <Modal
      size="auto"
      title={"Platform Connections"}
      isOpen={currentPath.includes("connect")}
      onClose={() => {
        router.back();
      }}
    >
      <AvailablePlatforms />
    </Modal>
  );
};

export default PlatformConnectionPersistentModalPage;
