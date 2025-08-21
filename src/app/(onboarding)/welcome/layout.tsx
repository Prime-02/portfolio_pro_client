"use client";
import React from "react";
import StepsMap from "./page-components/StepsMap";

const OnBoardingLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="flex">
      <StepsMap />
      <div className="flex-1 mx-auto  max-w-5xl min-w-sm overflow-auto mt-5 ">
        <div
          className="rounded-3xl border p-2 border-[var(--accent)]/20"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default OnBoardingLayout;
