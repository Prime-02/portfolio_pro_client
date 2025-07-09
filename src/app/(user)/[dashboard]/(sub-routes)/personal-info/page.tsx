"use client";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { useGlobalState } from "@/app/globalStateProvider";
import React from "react";
const page = () => {
  const { theme } = useTheme();
  const {userData, fetchUserData, loading, setLoading} = useGlobalState()
  
  return (
    <div>
      <div>

      </div>
    </div>
  );
};

export default page;
