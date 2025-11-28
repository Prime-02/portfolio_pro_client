"use client";
import React, {
  ReactNode,
  MouseEvent,
  useState,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { getLoader, SpinLoader } from "../loaders/Loader";
import { useTheme } from "../theme/ThemeContext ";
import { getColorShade } from "../utilities/syncFunctions/syncs";

type ButtonProps = {
  icon?: ReactNode;
  icon2?: ReactNode;
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
  customColor?: string;
  colorIntensity?: "light" | "medium" | "dark";
  maxWidth?: string; // Optional max width for the button
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

  // Only log warning on client side to prevent hydration mismatch
  if (typeof window !== "undefined") {
    console.warn(`Could not parse color format: "${colorStr}", using fallback`);
  }
  return "#05df72";
};

// Enhanced color generation with intensity options
const generateColorPalette = (
  baseColor: string,
  intensity: "light" | "medium" | "dark" = "medium"
) => {
  const intensityValues = {
    light: { hover: 85, active: 70, veryLight: 10 },
    medium: { hover: 80, active: 65, veryLight: 15 },
    dark: { hover: 75, active: 60, veryLight: 20 },
  };

  const values = intensityValues[intensity];

  return {
    base: baseColor,
    hover: getColorShade(baseColor, values.hover),
    active: getColorShade(baseColor, values.active),
    veryLight: getColorShade(baseColor, values.veryLight),
    disabled: "#9ca3af",
    disabledText: "#6b7280",
  };
};

const Button = ({
  icon,
  icon2,
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
  maxWidth,
}: ButtonProps) => {
  const { accentColor, loader } = useTheme();
  const Loader = getLoader(loader) || SpinLoader;
  const buttonRef = useRef<HTMLButtonElement>(null);

  // State for interaction tracking - initialized to false for consistent SSR
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Track hydration to prevent mismatches
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Memoize color calculations to prevent unnecessary recalculations
  const colorPalette = useMemo(() => {
    const baseColor = normalizeColorToHex(customColor || accentColor.color);
    return generateColorPalette(baseColor, colorIntensity);
  }, [customColor, accentColor.color, colorIntensity]);

  // Memoize variant-specific color palettes
  const variantColorPalettes = useMemo(
    () => ({
      danger: {
        base: "#ef4444",
        hover: getColorShade("#ef4444", 25),
        active: getColorShade("#ef4444", 15),
        veryLight: getColorShade("#ef4444", 10),
        disabled: "#9ca3af",
        disabledText: "#6b7280",
      },
      success: generateColorPalette("#10b981", colorIntensity),
    }),
    [colorIntensity]
  );

  // Size configurations - stable object to prevent re-renders
  const sizeClasses = useMemo(
    () => ({
      "3xs": "px-1 py-0.5 text-2xs min-h-4 gap-0.5",
      xxs: "px-1.5 py-0.75 text-2xs min-h-5 gap-0.75",
      xs: "px-2 py-1 text-xs min-h-6 gap-1",
      sm: "px-3 py-1.5 text-sm min-h-8 gap-1.5",
      md: "px-4 py-2 text-base min-h-10 gap-2",
      lg: "px-6 py-3 text-lg min-h-12 gap-2.5",
    }),
    []
  );

  // Base classes for all variants - memoized for consistency
  const baseClasses = useMemo(
    () =>
      `
    cursor-pointer w-full max-w-full flex items-center justify-center rounded-lg 
    focus:outline-none transition-all duration-200 font-medium border 
    disabled:cursor-not-allowed active:scale-95 transform
  `
        .replace(/\s+/g, " ")
        .trim(),
    []
  );

  // Get current interaction state - only use interactive states after hydration
  const getCurrentState = () => {
    if (disabled) return "disabled";
    if (!isHydrated) return "default"; // Always return default during SSR
    if (isActive) return "active";
    if (isHovered) return "hovered";
    if (isFocused) return "focused";
    return "default";
  };

  // Generate dynamic styles based on variant and state
  const getDynamicStyles = () => {
    const currentState = getCurrentState();
    let palette = colorPalette;

    // Use specific palette for danger and success variants
    if (variant === "danger") palette = variantColorPalettes.danger;
    if (variant === "success") palette = variantColorPalettes.success;

    const baseStyles: React.CSSProperties = {
      maxWidth: maxWidth || undefined,
    };

    // Common disabled styles
    if (currentState === "disabled") {
      return {
        ...baseStyles,
        backgroundColor:
          variant === "outline" || variant === "ghost"
            ? "transparent"
            : palette.disabled,
        borderColor:
          variant === "outline" || variant === "secondary"
            ? palette.disabled
            : "transparent",
        color:
          variant === "outline" || variant === "ghost"
            ? palette.disabledText
            : "#ffffff",
        boxShadow: "none",
        opacity: variant === "ghost" ? 0.5 : 1,
      };
    }

    // Get state-specific colors
    const getStateColor = (state: string) => {
      switch (state) {
        case "active":
          return palette.active;
        case "hovered":
          return palette.hover;
        case "focused":
          return palette.base;
        default:
          return palette.base;
      }
    };

    const stateColor = getStateColor(currentState);
    const isInteractive =
      currentState === "hovered" || currentState === "active";

    // Variant-specific styles
    switch (variant) {
      case "primary":
        return {
          ...baseStyles,
          backgroundColor: stateColor,
          borderColor: stateColor,
          color: "#ffffff",
          boxShadow: isInteractive
            ? `0 4px 12px ${palette.base}40, 0 2px 4px ${palette.base}20`
            : `0 2px 4px ${palette.base}20`,
          transform: currentState === "active" ? "scale(0.95)" : "scale(1)",
        };

      case "secondary":
        return {
          ...baseStyles,
          backgroundColor: isInteractive ? palette.veryLight : stateColor,
          borderColor: stateColor,
          color: "#ffffff",
          boxShadow: isInteractive
            ? `0 4px 12px ${palette.base}30, 0 2px 4px ${palette.base}15`
            : `0 1px 3px ${palette.base}15`,
          transform: currentState === "active" ? "scale(0.95)" : "scale(1)",
        };

      case "outline":
        return {
          ...baseStyles,
          backgroundColor: isInteractive ? stateColor : "transparent",
          borderColor: stateColor,
          color: isInteractive ? "#ffffff" : palette.base,
          boxShadow: isInteractive ? `0 2px 8px ${palette.base}20` : "none",
          transform: currentState === "active" ? "scale(0.95)" : "scale(1)",
        };

      case "ghost":
        return {
          ...baseStyles,
          backgroundColor: "transparent",
          borderColor: "transparent",
          color: palette.base,
          boxShadow: "none",
          textDecoration: isInteractive ? "underline" : "none",
          transform: currentState === "active" ? "scale(0.95)" : "scale(1)",
        };

      case "danger":
        return {
          ...baseStyles,
          backgroundColor: stateColor,
          borderColor: stateColor,
          color: "#ffffff",
          boxShadow: isInteractive
            ? `0 4px 12px ${palette.base}40, 0 2px 4px ${palette.base}20`
            : `0 2px 4px ${palette.base}20`,
          transform: currentState === "active" ? "scale(0.95)" : "scale(1)",
        };

      case "success":
        return {
          ...baseStyles,
          backgroundColor: stateColor,
          borderColor: stateColor,
          color: "#ffffff",
          boxShadow: isInteractive
            ? `0 4px 12px ${palette.base}40, 0 2px 4px ${palette.base}20`
            : `0 2px 4px ${palette.base}20`,
          transform: currentState === "active" ? "scale(0.95)" : "scale(1)",
        };

      default:
        return baseStyles;
    }
  };

  // Get loader color based on variant and state
  const getLoaderColor = () => {
    if (variant === "outline" && !isHovered && !isActive)
      return colorPalette.base;
    if (variant === "ghost") return colorPalette.base;
    return "#ffffff";
  };

  // Get focus ring color for accessibility
  const getFocusRingColor = () => {
    if (variant === "danger") return variantColorPalettes.danger.base;
    if (variant === "success") return variantColorPalettes.success.base;
    return colorPalette.base;
  };

  const dynamicStyles = getDynamicStyles();

  // Handle focus styles without direct DOM manipulation during render
  const handleFocusCapture = (e: React.FocusEvent<HTMLButtonElement>) => {
    if (!isHydrated) return;

    const focusRingColor = getFocusRingColor();
    const currentBoxShadow = dynamicStyles.boxShadow || "none";

    // Use setTimeout to avoid hydration issues
    setTimeout(() => {
      if (e.currentTarget) {
        e.currentTarget.style.setProperty(
          "box-shadow",
          `${currentBoxShadow}, 0 0 0 3px ${focusRingColor}40`
        );
      }
    }, 0);
  };

  const handleBlurCapture = (e: React.FocusEvent<HTMLButtonElement>) => {
    if (!isHydrated) return;

    // Use setTimeout to avoid hydration issues
    setTimeout(() => {
      if (e.currentTarget) {
        e.currentTarget.style.setProperty(
          "box-shadow",
          dynamicStyles.boxShadow || "none"
        );
      }
    }, 0);
  };

  return (
    <button
      ref={buttonRef}
      title={title || (text && text.length > 30 ? text : undefined)}
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${className}`}
      style={dynamicStyles}
      onClick={onClick}
      onMouseEnter={() =>
        isHydrated && !disabled && !loading && setIsHovered(true)
      }
      onMouseLeave={() => {
        if (isHydrated) {
          setIsHovered(false);
          setIsActive(false);
        }
      }}
      onMouseDown={() =>
        isHydrated && !disabled && !loading && setIsActive(true)
      }
      onMouseUp={() => isHydrated && setIsActive(false)}
      onFocus={() => isHydrated && setIsFocused(true)}
      onBlur={() => isHydrated && setIsFocused(false)}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
    >
      {loading ? (
        <Loader
          size={size === "sm" ? 16 : size === "lg" ? 28 : 20}
          color={getLoaderColor()}
        />
      ) : (
        <>
          {icon && (
            <span
              className="flex-shrink-0 transition-transform duration-200"
              style={{
                transform:
                  getCurrentState() === "active" ? "scale(0.9)" : "scale(1)",
              }}
            >
              {icon}
            </span>
          )}
          {text && (
            <span
              className="truncate transition-transform duration-200"
              style={{
                transform:
                  getCurrentState() === "active" ? "scale(0.9)" : "scale(1)",
                minWidth: 0,
              }}
            >
              {text}
            </span>
          )}
          {icon2 && (
            <span
              className="flex-shrink-0 transition-transform duration-200"
              style={{
                transform:
                  getCurrentState() === "active" ? "scale(0.9)" : "scale(1)",
              }}
            >
              {icon2}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;
