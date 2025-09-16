"use client";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { ReactNode } from "react";

const RootImportLayout = ({
  portfoliopro,
  vercel,
  github,
  figma,
  canva,
}: {
  portfoliopro: ReactNode;
  vercel: ReactNode;
  github: ReactNode;
  figma: ReactNode;
  canva: ReactNode;
}) => {
  const { checkParams } = useGlobalState();
  const currentScreen = checkParams("platform");

  switch (currentScreen) {
    case "portfoliopro":
      return portfoliopro;

    case "vercel":
      return vercel;

    case "github":
      return github;

    case "figma":
      return figma;

    case "canva":
      return canva;

    default:
      return portfoliopro;
  }
};

export default RootImportLayout;
