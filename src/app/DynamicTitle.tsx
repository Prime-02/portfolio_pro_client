"use client";

import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { useEffect } from "react";


const DynamicTitle = () => {
  const { userInfo } = useUserSettings(); 

  useEffect(() => {
    const title = userInfo?.username ? `Welcome - ${userInfo?.username}` : `Welcome To Portfolio Pro`;
    document.title = title; 
  }, [userInfo]);

  return null; 
};

export default DynamicTitle;
