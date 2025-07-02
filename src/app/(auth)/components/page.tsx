"use client";
import InputDemo from "@/app/components/inputs/InputDemo";
import LoaderDemo from "@/app/components/loaders/Loader";
import ThemeToggle from "@/app/components/theme/ThemeToggle";
import { ToastDemo } from "@/app/components/toastify/ToastDemo";
import React, { useState } from "react";
import { ButtonExamples } from "@/app/components/buttons/ButtonDemo";

const page = () => {
  return (
    <div>
      <ToastDemo />
      <InputDemo />
      <ThemeToggle />
      <LoaderDemo />
      <ButtonExamples />
    </div>
  );
};

export default page;
