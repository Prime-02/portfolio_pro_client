// Shared types for loaders and theme system

import { ModalType } from "@/app/(user)/[dashboard]/(sub-routes)/profile/page-components/DisplayPictures";
import { IconType } from "react-icons";

export interface LoaderProps {
  size?: number;
  color?: string;
  thickness?: number;
  gap?: number;
  small?: boolean;
  className?: string;
}

export type LoaderOptions =
  | "spin-loader"
  | "dots-loader"
  | "bars-loader"
  | "wave-loader"
  | "orbit-loader"
  | "grid-loader"
  | "morph-loader"
  | "ripple-loader"
  | "spiral-loader"
  | "cube-flip-loader"
  | "elastic-loader"
  | "gear-loader"
  | "pendulum-loader"
  | "typing-loader"
  | "liquid-loader"
  | "hexagon-loader"
  | "particle-loader"
  | "radar-loader"
  | "infinity-loader"
  | "magnetic-loader"
  | "spinner-dots"
  | "pulse-ring"
  | "zigzag-loader"
  | "portfolio-pro"
  | "bloom-loader";

export type LoaderInput = string | { style: string };
export type Loader = LoaderOptions;

export type Theme = {
  background: string;
  foreground: string;
};

export type Accent = {
  color: string;
};

export type ThemeVariant = "light" | "dark" | "system";

export type LanguageProps = {
  name: string;
  code: string;
};

export interface LoaderOption {
  id: string;
  code: string;
}

export type ImageAction = {
  name: string;
  action?: (e?: ModalType) => void;
  icon: IconType;
  tab: string
};
