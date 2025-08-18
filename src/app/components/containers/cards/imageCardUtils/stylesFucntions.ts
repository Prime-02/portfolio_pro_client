import { useTheme } from "@/app/components/theme/ThemeContext ";
import {
  BorderColorVariant,
  BorderRadiusVariant,
  BorderStyleVariant,
  ColorVariant,
  ShadowVariant,
  SpacingVariant,
  TextSizeVariant,
  TextWeightVariant,
  TransitionVariant,
} from "@/app/components/types and interfaces/ImageCardTypes";
import { keyframes } from "styled-components";
import { PopOverPosition } from "../../divs/PopOver";

// Keyframe animations
export const gradientShift = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

export const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

export const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
  40%, 43% { transform: translate3d(0, -30px, 0); }
  70% { transform: translate3d(0, -15px, 0); }
  90% { transform: translate3d(0, -4px, 0); }
`;

export const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

export const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
`;

// Style mapping functions
export const getBorderRadius = (variant: BorderRadiusVariant): string => {
  const map = {
    none: "0",
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "50%",
  };
  return map[variant];
};

export const getShadow = (variant: ShadowVariant): string => {
  const map = {
    none: "none",
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    colored: "0 10px 15px -3px rgb(59 130 246 / 0.25)",
  };
  return map[variant];
};

export const getBorderColor = (variant: BorderColorVariant): string => {
  const { accentColor } = useTheme();
  const colorMap = {
    default: accentColor.color,
    transparent: "transparent",
    current: "currentColor",
    black: "#000000",
    white: "#ffffff",
    "gray-100": "#f3f4f6",
    "gray-200": "#e5e7eb",
    "gray-300": "#d1d5db",
    "gray-400": "#9ca3af",
    "gray-500": "#6b7280",
    "gray-600": "#4b5563",
    "gray-700": "#374151",
    "gray-800": "#1f2937",
    "gray-900": "#111827",
    "red-100": "#fee2e2",
    "red-200": "#fecaca",
    "red-300": "#fca5a5",
    "red-400": "#f87171",
    "red-500": "#ef4444",
    "red-600": "#dc2626",
    "red-700": "#b91c1c",
    "red-800": "#991b1b",
    "red-900": "#7f1d1d",
    "orange-100": "#fed7aa",
    "orange-200": "#fed7aa",
    "orange-300": "#fdba74",
    "orange-400": "#fb923c",
    "orange-500": "#f97316",
    "orange-600": "#ea580c",
    "orange-700": "#c2410c",
    "orange-800": "#9a3412",
    "orange-900": "#7c2d12",
    "yellow-100": "#fef3c7",
    "yellow-200": "#fde68a",
    "yellow-300": "#fcd34d",
    "yellow-400": "#fbbf24",
    "yellow-500": "#f59e0b",
    "yellow-600": "#d97706",
    "yellow-700": "#b45309",
    "yellow-800": "#92400e",
    "yellow-900": "#78350f",
    "green-100": "#dcfce7",
    "green-200": "#bbf7d0",
    "green-300": "#86efac",
    "green-400": "#4ade80",
    "green-500": "#22c55e",
    "green-600": "#16a34a",
    "green-700": "#15803d",
    "green-800": "#166534",
    "green-900": "#14532d",
    "blue-100": "#dbeafe",
    "blue-200": "#bfdbfe",
    "blue-300": "#93c5fd",
    "blue-400": "#60a5fa",
    "blue-500": "#3b82f6",
    "blue-600": "#2563eb",
    "blue-700": "#1d4ed8",
    "blue-800": "#1e40af",
    "blue-900": "#1e3a8a",
    "indigo-100": "#e0e7ff",
    "indigo-200": "#c7d2fe",
    "indigo-300": "#a5b4fc",
    "indigo-400": "#818cf8",
    "indigo-500": "#6366f1",
    "indigo-600": "#4f46e5",
    "indigo-700": "#4338ca",
    "indigo-800": "#3730a3",
    "indigo-900": "#312e81",
    "purple-100": "#f3e8ff",
    "purple-200": "#e9d5ff",
    "purple-300": "#d8b4fe",
    "purple-400": "#c084fc",
    "purple-500": "#a855f7",
    "purple-600": "#9333ea",
    "purple-700": "#7c3aed",
    "purple-800": "#6b21a8",
    "purple-900": "#581c87",
    "pink-100": "#fce7f3",
    "pink-200": "#fbcfe8",
    "pink-300": "#f9a8d4",
    "pink-400": "#f472b6",
    "pink-500": "#ec4899",
    "pink-600": "#db2777",
    "pink-700": "#be185d",
    "pink-800": "#9d174d",
    "pink-900": "#831843",
    primary: "#3b82f6",
    secondary: "#6b7280",
    accent: "#a855f7",
    neutral: "#374151",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#06b6d4",
  };
  return colorMap[variant];
};

export const getTextSize = (variant: TextSizeVariant): string => {
  const map = {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  };
  return map[variant];
};

export const getPadding = (variant: SpacingVariant): string => {
  const map = {
    none: "0",
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "2.5rem",
    "3xl": "3rem",
  };
  return map[variant];
};

export const getTransitionDuration = (variant: TransitionVariant): string => {
  const map = {
    none: "0ms",
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
    slower: "700ms",
  };
  return map[variant];
};

export const getFontWeight = (variant: TextWeightVariant): string => {
  const map = {
    thin: "100",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  };
  return map[variant];
};

export const getColorTheme = (variant: ColorVariant) => {
  const { theme } = useTheme();
  const themes = {
    primary: {
      bg: theme.background,
      bgDark: theme.background,
      text: theme.foreground,
      textDark: theme.foreground,
    },
    secondary: {
      bg: "#f9fafb",
      bgDark: "rgba(17, 24, 39, 0.2)",
      text: "#111827",
      textDark: "#f9fafb",
    },
    accent: {
      bg: "#faf5ff",
      bgDark: "rgba(88, 28, 135, 0.2)",
      text: "#581c87",
      textDark: "#f3e8ff",
    },
    neutral: {
      bg: "#fafafa",
      bgDark: "rgba(23, 23, 23, 0.2)",
      text: "#171717",
      textDark: "#fafafa",
    },
    success: {
      bg: "#f0fdf4",
      bgDark: "rgba(21, 128, 61, 0.2)",
      text: "#15803d",
      textDark: "#dcfce7",
    },
    warning: {
      bg: "#fefce8",
      bgDark: "rgba(161, 98, 7, 0.2)",
      text: "#a16207",
      textDark: "#fef3c7",
    },
    error: {
      bg: "#fef2f2",
      bgDark: "rgba(185, 28, 28, 0.2)",
      text: "#b91c1c",
      textDark: "#fecaca",
    },
    info: {
      bg: "#f0f9ff",
      bgDark: "rgba(7, 89, 133, 0.2)",
      text: "#075985",
      textDark: "#e0f2fe",
    },
  };
  return themes[variant];
};

// Helper function to get border CSS
export const getBorderCSS = (
  style: BorderStyleVariant,
  width: number,
  color: BorderColorVariant | string = "primary"
): string => {
  if (style === "none" || width === 0) return "none";

  const borderColor =
    color.startsWith("#") || color.startsWith("rgb") || color.startsWith("hsl")
      ? color
      : getBorderColor(color as BorderColorVariant);

  return `${width}px ${style} ${borderColor}`;
};



export const positionMap: Record<PopOverPosition, string> = {
  'top-right': 'top: 0.75rem; right: 0.75rem;',
  'top-left': 'top: 0.75rem; left: 0.75rem;',
  'top-center': 'top: 0.75rem; left: 50%; transform: translateX(-50%);',
  'bottom-right': 'bottom: 0.75rem; right: 0.75rem;',
  'bottom-left': 'bottom: 0.75rem; left: 0.75rem;',
  'bottom-center': 'bottom: 0.75rem; left: 50%; transform: translateX(-50%);',
  'center-right': 'top: 50%; right: 0.75rem; transform: translateY(-50%);',
  'center-left': 'top: 50%; left: 0.75rem; transform: translateY(-50%);',
};