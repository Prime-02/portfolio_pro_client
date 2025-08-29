import { useGlobalState } from "@/app/globalStateProvider";
import React from "react";
import Approved from "./Approved";
import UnApproved from "./UnApproved";

const Google = () => {
  const { checkParams } = useGlobalState();
  const code = checkParams("code");

  if (code) {
    return <Approved />;
  } else return <UnApproved />;
};

export default Google;
