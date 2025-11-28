import Button from "@/app/components/buttons/Buttons";
import { useGlobalState } from "@/app/globalStateProvider";
import React from "react";

const LogOutComponent = () => {
  const { logOut, isLoading } = useGlobalState();
  return (
    <div className="flex flex-col items-center min-h-full h-auto justify-around">
      <p className="mb-6 font-semibold">Are you sure you want to log out?</p>
      <div>
        <Button
          variant="danger"
          size="md"
          text="Proceed?"
          onClick={() => {
            logOut();
          }}
          loading={isLoading("logging_out")}
          disabled={isLoading("logging_out")}
        />
      </div>
    </div>
  );
};

export default LogOutComponent;
