import { Palette, Zap } from "lucide-react";

export const themePresets = [
  {
    name: "Portfolio Pro",
    accent: "#737373",
    light: { background: "#ffffff", foreground: "#171717" },
    dark: { background: "#000000", foreground: "#ededed" },
  },
  {
    name: "Ocean",
    accent: "#00a3e0", // Bright cyan, pops against both light blue and dark navy
    light: { background: "#f0f9ff", foreground: "#0c4a6e" },
    dark: { background: "#000000", foreground: "#e0f2fe" },
  },
  {
    name: "Forest",
    accent: "#22c55e", // Vivid green, slightly brighter to stand out
    light: { background: "#f0fdf4", foreground: "#14532d" },
    dark: { background: "#000000", foreground: "#dcfce7" },
  },
  {
    name: "Sunset",
    accent: "#f97316", // Bright orange, more vibrant than original
    light: { background: "#fff7ed", foreground: "#9a3412" },
    dark: { background: "#000000", foreground: "#fed7aa" },
  },
  {
    name: "Midnight",
    accent: "#7dd3fc", // Light sky blue, pops against slate tones
    light: { background: "#f8fafc", foreground: "#1e293b" },
    dark: { background: "#000000", foreground: "#f1f5f9" },
  },
  {
    name: "Rose",
    accent: "#f43f5e", // Vivid rose, slightly brighter for impact
    light: { background: "#fdf2f8", foreground: "#9f1239" },
    dark: { background: "#000000", foreground: "#fce7f3" },
  },
  {
    name: "Violet",
    accent: "#a855f7", // Bright purple, ensures strong visibility
    light: { background: "#faf5ff", foreground: "#6b21a8" },
    dark: { background: "#000000", foreground: "#e9d5ff" },
  },
  {
    name: "Crimson",
    accent: "#dc2626", // Bold red, high contrast for both modes
    light: { background: "#fef2f2", foreground: "#7f1d1d" },
    dark: { background: "#000000", foreground: "#fee2e2" },
  },
  {
    name: "Amber",
    accent: "#fbbf24", // Warm amber, pops against soft backgrounds
    light: { background: "#fffbeb", foreground: "#713f12" },
    dark: { background: "#000000", foreground: "#fef9c3" },
  },
  {
    name: "Emerald",
    accent: "#10b981", // Rich emerald, vibrant and distinct
    light: { background: "#ecfdf5", foreground: "#064e3b" },
    dark: { background: "#000000", foreground: "#d1fae5" },
  },
  {
    name: "Indigo",
    accent: "#6366f1", // Bright indigo, stands out clearly
    light: { background: "#eef2ff", foreground: "#312e81" },
    dark: { background: "#000000", foreground: "#e0e7ff" },
  },
  {
    name: "Coral",
    accent: "#ff6b6b", // Vivid coral, energetic and distinct
    light: { background: "#fff1f2", foreground: "#9d174d" },
    dark: { background: "#000000", foreground: "#ffe4e6" },
  },
];
export const tabConfig = [
  {
    key: "themes",
    label: "Themes",
    icon: Palette,
    description: "Pre-built theme presets",
    helpText:
      "Choose from beautiful pre-designed themes or create your own custom color combinations for light and dark modes.",
  },
  // {
  //   key: "loaders",
  //   label: "Loaders",
  //   icon: Loader,
  //   description: "Loading animations",
  //   helpText:
  //     "Select from various loading animations that will be displayed while your app processes data or loads content.",
  // },
  {
    key: "pro",
    label: "Go-Pro",
    icon: Zap,
    description: "Advanced customization",
    helpText:
      "Fine-tune every aspect of your theme with advanced color controls and import/export your theme configurations.",
  },
];
