import Button from "@/app/components/buttons/Buttons";
import { useGlobalState } from "@/app/globalStateProvider";
import React from "react";

const LogOutComponent = () => {
  const { router, mockLogOut } = useGlobalState();
  return (
    <div className="flex flex-col items-center min-h-full h-auto justify-around">
      <p className="mb-6 font-semibold">Are you sure you want to log out?</p>
      <div>
        <Button
          variant="danger"
          size="md"
          text="Proceed?"
          onClick={() => {
            mockLogOut();
            router.push("/user-auth?auth_mode=login");
          }}
        />
      </div>
    </div>
  );
};

export default LogOutComponent;
