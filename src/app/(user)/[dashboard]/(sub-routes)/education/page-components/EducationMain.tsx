import React from "react";
import EducationHeader from "./EducationHeader";
import Modal from "@/app/components/containers/modals/Modal";
import { useGlobalState } from "@/app/globalStateProvider";
import EducationActions from "./EducationActions";
import EducationsDisplay from "./EducationsDisplay";

const EducationMain = () => {
  const { checkParams, clearQuerryParam, checkValidId } = useGlobalState();
  return (
    <>
      <div>
        <EducationHeader />
        <EducationsDisplay />
      </div>
      <Modal
        isOpen={
          checkParams("create") === "true" ||
          checkValidId(checkParams("update") || "")
        }
        onClose={clearQuerryParam}
        centered
        title={
          checkParams("create") === "true"
            ? "Add new education"
            : checkValidId(checkParams("update") || "")
              ? "Update this education"
              : ""
        }
      >
        <EducationActions />
      </Modal>
    </>
  );
};

export default EducationMain;
