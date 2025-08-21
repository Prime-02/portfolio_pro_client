"use client";
import InputDemo from "@/app/components/inputs/InputDemo";
import ThemeToggle from "@/app/components/theme/ThemeToggle";
import { ToastDemo } from "@/app/components/toastify/ToastDemo";
import React from "react";
import { ButtonExamples } from "@/app/components/buttons/ButtonDemo";
import { TextFormatterDemo } from "@/app/components/containers/TextFormatters/TextFormatter";

const page = () => {
  return (
    <div>
      <ToastDemo />
      <InputDemo />
      <ThemeToggle />
      <ButtonExamples />
      <TextFormatterDemo />
    </div>
  );
};

export default page;
