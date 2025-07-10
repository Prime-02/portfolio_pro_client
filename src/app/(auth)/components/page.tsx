"use client";
import InputDemo from "@/app/components/inputs/InputDemo";
import ThemeToggle from "@/app/components/theme/ThemeToggle";
import { ToastDemo } from "@/app/components/toastify/ToastDemo";
import React from "react";
import { ButtonExamples } from "@/app/components/buttons/ButtonDemo";

const page = () => {
  return (
    <div>
      <ToastDemo />
      <InputDemo />
      <ThemeToggle />
      <ButtonExamples />
    </div>
  );
};

export default page;
