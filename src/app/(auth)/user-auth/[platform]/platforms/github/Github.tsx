import { useGlobalState } from "@/app/globalStateProvider";
import React from "react";
import Approved from "./Approved";
import UnApproved from "./UnApproved";

const Github = () => {
  const { checkParams } = useGlobalState();
  const code = checkParams("code");
  const installation_id = checkParams("installation_id");

  if (code && installation_id) {
    return <Approved />;
  } else return <UnApproved />;
};

export default Github;
