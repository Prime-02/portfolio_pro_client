import { useUIStore } from "@/lib/stores/ui/useUIStore";
import { useAuthStore } from "@/lib/stores/user/useAuthStore";
import React from "react";
import Button from "../../../buttons/Buttons";
import { useRouting } from "@/lib/hooks/routing/useRouting";

const LogOutComponent = () => {
  const { logout } = useAuthStore();
  const { startLoading, stopLoading, isLoading, } = useUIStore()

  const { router } = useRouting()

  const logOut = async () => {
    startLoading("logging_out");
    try {
      await logout();
      router.push("/")
    } finally {
      stopLoading("logging_out");
    }
  };

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
