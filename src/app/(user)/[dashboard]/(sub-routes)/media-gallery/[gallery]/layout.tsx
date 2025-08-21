"use client";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { ReactNode } from "react";

const GalleryLayout = (props: { children: ReactNode; modal: ReactNode }) => {
  const { searchParams } = useGlobalState();
  const customize = searchParams.get("customize");

  return (
    <div>
      {props.children}
      {!customize && props.modal}
    </div>
  );
};

export default GalleryLayout;
