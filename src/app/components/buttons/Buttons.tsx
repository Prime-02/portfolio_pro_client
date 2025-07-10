import React, { ReactNode, MouseEvent, useState } from "react";
import { getLoader, SpinLoader } from "../loaders/Loader";
import { useTheme } from "../theme/ThemeContext ";
import { getColorShade } from "../utilities/syncFunctions/syncs";

type ButtonProps = {
  icon?: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  text?: string;
  loading?: boolean;
  disabled?: boolean;
  title?: string;
  type?: "button" | "submit" | "reset";
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "success";
  size?: "sm" | "md" | "lg";
  customColor?: string; // Allow custom color override
  colorIntensity?: "light" | "medium" | "dark"; // Color intensity options
};

// Enhanced color normalization with better error handling
const normalizeColorToHex = (color: string): string => {
  if (!color) return "#05df72";

  const colorStr = String(color).trim();

  // Valid hex formats
  if (/^#[0-9A-F]{6}$/i.test(colorStr)) return colorStr;
  if (/^#[0-9A-F]{3}$/i.test(colorStr)) {
    const [, r, g, b] = colorStr;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (/^[0-9A-F]{6}$/i.test(colorStr)) return `#${colorStr}`;
  if (/^[0-9A-F]{3}$/i.test(colorStr)) {
    const [r, g, b] = colorStr;
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  // RGB format
  const rgbMatch = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    const toHex = (n: string) =>
      Math.min(255, Math.max(0, parseInt(n)))
        .toString(16)
        .padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // RGBA format (ignore alpha for now)
  const rgbaMatch = colorStr.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
  if (rgbaMatch) {
    const [, r, g, b] = rgbaMatch;
    const toHex = (n: string) =>
      Math.min(255, Math.max(0, parseInt(n)))
        .toString(16)
        .padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // HSL format (basic conversion)
  const hslMatch = colorStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (hslMatch) {
    const [, h, s, l] = hslMatch.map(Number);
    const hslToHex = (h: number, s: number, l: number): string => {
      s /= 100;
      l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
          .toString(16)
          .padStart(2, "0");
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    };
    return hslToHex(h, s, l);
  }

  // Named colors (basic set)
  const namedColors: { [key: string]: string } = {
    red: "#ff0000",
    green: "#008000",
    blue: "#0000ff",
    yellow: "#ffff00",
    orange: "#ffa500",
    purple: "#800080",
    pink: "#ffc0cb",
    brown: "#a52a2a",
    black: "#000000",
    white: "#ffffff",
    gray: "#808080",
    grey: "#808080",
  };

  const lowerColor = colorStr.toLowerCase();
  if (namedColors[lowerColor]) return namedColors[lowerColor];

  console.warn(`Could not parse color format: "${colorStr}", using fallback`);
  return "#05df72";
};

// Enhanced color generation with intensity options
const generateColorPalette = (
  baseColor: string,
  intensity: "light" | "medium" | "dark" = "medium"
) => {
  const intensityMultipliers = {
    light: { hover: 10, active: 20, veryLight: 3 },
    medium: { hover: 15, active: 25, veryLight: 5 },
    dark: { hover: 20, active: 30, veryLight: 8 },
  };

  const multipliers = intensityMultipliers[intensity];

  return {
    base: baseColor,
    hover: getColorShade(baseColor, 100 - multipliers.hover),
    active: getColorShade(baseColor, 100 - multipliers.active),
    veryLight: getColorShade(baseColor, multipliers.veryLight),
    disabled: "#9ca3af",
    disabledText: "#6b7280",
  };
};

const Button = ({
  icon,
  onClick,
  className = "",
  text = "",
  loading = false,
  disabled = false,
  title,
  type = "button",
  variant = "primary",
  size = "md",
  customColor,
  colorIntensity = "medium",
}: ButtonProps) => {
  const { accentColor, loader } = useTheme();
  const Loader = getLoader(loader) || SpinLoader;

  // State to track hover and active states for better control
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Use custom color if provided, otherwise use theme accent color
  const baseColor = normalizeColorToHex(customColor || accentColor.color);
  const colorPalette = generateColorPalette(baseColor, colorIntensity);

  // Size configurations with better spacing
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm min-h-8 gap-1.5",
    md: "px-4 py-2 text-base min-h-10 gap-2",
    lg: "px-6 py-3 text-lg min-h-12 gap-2.5",
  };

  // Base classes for all variants
  const baseClasses = `
    cursor-pointer min-w-fit flex items-center justify-center rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
    transition-all duration-200 font-medium border-2 disabled:cursor-not-allowed
    active:scale-95 transform
  `
    .replace(/\s+/g, " ")
    .trim();

  // Get variant-specific styles
  const getVariantStyles = () => {
    if (disabled) {
      return {
        backgroundColor:
          variant === "outline" || variant === "ghost"
            ? "transparent"
            : colorPalette.disabled,
        borderColor:
          variant === "outline" || variant === "secondary"
            ? colorPalette.disabled
            : "transparent",
        color:
          variant === "outline" || variant === "ghost"
            ? colorPalette.disabledText
            : "#ffffff",
        boxShadow: "none",
      };
    }

    // Determine current state colors
    const getCurrentColors = () => {
      if (isActive) {
        return {
          bg: colorPalette.active,
          border: colorPalette.active,
          text: "#ffffff",
        };
      } else if (isHovered) {
        return {
          bg: colorPalette.hover,
          border: colorPalette.hover,
          text: "#ffffff",
        };
      } else {
        return {
          bg: colorPalette.base,
          border: colorPalette.base,
          text: colorPalette.base,
        };
      }
    };

    const currentColors = getCurrentColors();

    switch (variant) {
      case "primary":
        return {
          backgroundColor: currentColors.bg,
          borderColor: currentColors.border,
          color: "#ffffff",
          boxShadow: isHovered
            ? "0 4px 12px rgba(0,0,0,0.15)"
            : "0 2px 4px rgba(0,0,0,0.1)",
          focusRingColor: colorPalette.base,
        };

      case "secondary":
        return {
          backgroundColor:
            isHovered || isActive ? currentColors.bg : colorPalette.veryLight,
          borderColor: currentColors.border,
          color: isHovered || isActive ? "#ffffff" : colorPalette.base,
          boxShadow: isHovered
            ? "0 4px 12px rgba(0,0,0,0.15)"
            : "0 1px 3px rgba(0,0,0,0.1)",
          focusRingColor: colorPalette.base,
        };

      case "outline":
        return {
          backgroundColor:
            isHovered || isActive ? currentColors.bg : "transparent",
          borderColor: currentColors.border,
          color: isHovered || isActive ? "#ffffff" : colorPalette.base,
          boxShadow: isHovered ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
          focusRingColor: colorPalette.base,
        };

      case "ghost":
        return {
          backgroundColor:
            isHovered || isActive ? colorPalette.veryLight : "transparent",
          borderColor: "transparent",
          color: colorPalette.base,
          boxShadow: "none",
          focusRingColor: colorPalette.base,
        };

      case "danger":
        const dangerColors = generateColorPalette("#ef4444", colorIntensity);
        return {
          backgroundColor: isActive
            ? dangerColors.active
            : isHovered
              ? dangerColors.hover
              : dangerColors.base,
          borderColor: isActive
            ? dangerColors.active
            : isHovered
              ? dangerColors.hover
              : dangerColors.base,
          color: "#ffffff",
          boxShadow: isHovered
            ? "0 4px 12px rgba(239,68,68,0.3)"
            : "0 2px 4px rgba(239,68,68,0.2)",
          focusRingColor: dangerColors.base,
        };

      case "success":
        const successColors = generateColorPalette("#10b981", colorIntensity);
        return {
          backgroundColor: isActive
            ? successColors.active
            : isHovered
              ? successColors.hover
              : successColors.base,
          borderColor: isActive
            ? successColors.active
            : isHovered
              ? successColors.hover
              : successColors.base,
          color: "#ffffff",
          boxShadow: isHovered
            ? "0 4px 12px rgba(16,185,129,0.3)"
            : "0 2px 4px rgba(16,185,129,0.2)",
          focusRingColor: successColors.base,
        };

      default:
        return {};
    }
  };

  const variantStyles = getVariantStyles();

  // Get loader color based on variant and state
  const getLoaderColor = () => {
    if (variant === "outline" && !isHovered && !isActive)
      return colorPalette.base;
    if (variant === "ghost") return colorPalette.base;
    return "#ffffff";
  };

  return (
    <button
      title={title}
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${className}`}
      style={{
        ...variantStyles,
        // focusRingColor: variantStyles.focusRingColor,
      }}
      onClick={onClick}
      onMouseEnter={() => !disabled && !loading && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => !disabled && !loading && setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onFocus={(e) => {
        if (variantStyles.focusRingColor) {
          e.currentTarget.style.setProperty(
            "--tw-ring-color",
            variantStyles.focusRingColor
          );
        }
      }}
    >
      {loading ? (
        <Loader
          size={size === "sm" ? 16 : size === "lg" ? 28 : 20}
          color={getLoaderColor()}
        />
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {text && <span className="flex-shrink-0">{text}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
