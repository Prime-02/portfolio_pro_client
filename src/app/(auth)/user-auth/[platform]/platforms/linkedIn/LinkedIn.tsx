import { useGlobalState } from "@/app/globalStateProvider";
import React from "react";
import Approved from "./Approved";
import UnApproved from "./UnApproved";

const LinkedIn = () => {
  const { checkParams } = useGlobalState();
  const code = checkParams("code");
  const error = checkParams("error");

  if (code) {
    return <Approved />;
  } else return <UnApproved />;
};

export default LinkedIn;
