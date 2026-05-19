"use client";

import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import React from "react";

const UsersDashboard = () => {
  const {userInfo} = useUserSettings()
  return <div>UsersDashboard: {userInfo?.username ?? "User"}</div>;
};

export default UsersDashboard;
