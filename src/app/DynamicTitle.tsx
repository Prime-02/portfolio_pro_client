"use client";

import { useEffect } from "react";
import { useGlobalState } from "./globalStateProvider";


const DynamicTitle = () => {
  const { userData } = useGlobalState(); 

  useEffect(() => {
    const title = userData.username && `Welcome ${userData.username}`;
    document.title = title; 
  }, [userData]);

  return null; 
};

export default DynamicTitle;
