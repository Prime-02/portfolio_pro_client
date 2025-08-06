"use client";
import { toast } from "@/app/components/toastify/Toastify";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useEffect } from "react";

const UsersDashboard = () => {
  const { userData } = useGlobalState();

  useEffect(() => {
    if (!userData.username) {
      toast.warning("Your profile is incomplete... Redirecting...", {
        title: "Incomplete profile",
      });
    }
  }, [userData.username]);
  return <div>UsersDashboard</div>;
};

export default UsersDashboard;
