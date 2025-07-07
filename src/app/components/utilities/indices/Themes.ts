import { ThemePreset } from "@/app/(user)/[dashboard]/profile/themes-loaders/page";
import { Crown, Loader, Palette } from "lucide-react";

export const themePresets: ThemePreset[] = [
    {
      name: "Portfolio Pro",
      accent: "#05df72",
      light: { background: "#ffffff", foreground: "#171717" },
      dark: { background: "#0a0a0a", foreground: "#ededed" },
    },
    {
      name: "Ocean",
      accent: "#0284c7",
      light: { background: "#f0f9ff", foreground: "#0c4a6e" },
      dark: { background: "#0c1929", foreground: "#e0f2fe" },
    },
    {
      name: "Forest",
      accent: "#16a34a",
      light: { background: "#f0fdf4", foreground: "#14532d" },
      dark: { background: "#0a1a0a", foreground: "#dcfce7" },
    },
    {
      name: "Sunset",
      accent: "#ea580c",
      light: { background: "#fff7ed", foreground: "#9a3412" },
      dark: { background: "#1a0b05", foreground: "#fed7aa" },
    },
    {
      name: "Midnight",
      accent: "#64748b",
      light: { background: "#f8fafc", foreground: "#1e293b" },
      dark: { background: "#0f172a", foreground: "#f1f5f9" },
    },
    {
      name: "Rose",
      accent: "#e11d48",
      light: { background: "#fdf2f8", foreground: "#9f1239" },
      dark: { background: "#1f0a13", foreground: "#fce7f3" },
    },
    {
      name: "Violet",
      accent: "#9333ea",
      light: { background: "#faf5ff", foreground: "#6b21a8" },
      dark: { background: "#1a0a1a", foreground: "#e9d5ff" },
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
    {
      key: "loaders",
      label: "Loaders",
      icon: Loader,
      description: "Loading animations",
      helpText:
        "Select from various loading animations that will be displayed while your app processes data or loads content.",
    },
    {
      key: "pro",
      label: "Go-Pro",
      icon: Crown,
      description: "Advanced customization",
      helpText:
        "Fine-tune every aspect of your theme with advanced color controls and import/export your theme configurations.",
    },
  ];