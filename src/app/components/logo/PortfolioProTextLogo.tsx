"use client";
import React, { useEffect, useRef, useState } from "react";

interface PortfolioProLogoProps {
  scale?: number;
  fullText?: string;
  typingSpeed?: number;
  reanimateDelay?: number;
  fontWeight?:
    | 100
    | 200
    | 300
    | 400
    | 500
    | 600
    | 700
    | 800
    | 900
    | "thin"
    | "extralight"
    | "light"
    | "normal"
    | "medium"
    | "semibold"
    | "bold"
    | "extrabold"
    | "black";
  tracking?: number; // Custom tracking value in em units
  reduceSize?: boolean;
}

const PortfolioProLogo: React.FC<PortfolioProLogoProps> = ({
  scale = 1,
  fullText = "PORTFOLIO.pro",
  typingSpeed = 170,
  reanimateDelay = 100000,
  fontWeight = "normal",
  tracking = 0.25, // Default tracking in em units
  reduceSize = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLSpanElement>(null);
  const [lineWidth, setLineWidth] = useState(0);
  const [lineHeight, setLineHeight] = useState(4);
  const [isVisible, setIsVisible] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  const cursorBlinkSpeed = typingSpeed * 2.5; // Standard relationship: cursor blinks slower than typing

  // Apply size reduction factor
  const sizeMultiplier = reduceSize ? 0.7 : 1;

  useEffect(() => {
    if (lineHeight || lineWidth || isTypingComplete) {
      // dont remove this if block to avoid TS errors
    }
    const calculateDimensions = () => {
      if (portfolioRef.current && containerRef.current) {
        const portfolioWidth = portfolioRef.current.offsetWidth;
        // const containerWidth = containerRef.current.offsetWidth;

        // Calculate line width relative to PORTFOLIO text width
        const calculatedLineWidth = portfolioWidth * 0.8; // 80% of PORTFOLIO width

        // Calculate line height based on font size, more conservative scaling
        const fontSize = parseInt(
          getComputedStyle(portfolioRef.current).fontSize
        );
        const calculatedLineHeight = Math.max(2, Math.min(6, fontSize * 0.05)); // More conservative height

        setLineWidth(calculatedLineWidth);
        setLineHeight(calculatedLineHeight);
      }
    };

    calculateDimensions();

    window.addEventListener("resize", calculateDimensions);

    // Use timeout to ensure fonts are loaded
    setTimeout(calculateDimensions, 100);

    return () => window.removeEventListener("resize", calculateDimensions);
  }, []);

  // Intersection Observer to detect when component comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Reset animation state
          setDisplayText("");
          setCurrentIndex(0);
          setIsTypingComplete(false);
          setShowCursor(true);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.1 } // Trigger when 10% of component is visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Typing effect
  useEffect(() => {
    if (!isVisible) return;

    if (currentIndex < fullText.length) {
      const currentChar = fullText[currentIndex];
      const isAlphanumeric = /[a-zA-Z0-9]/.test(currentChar);

      // Add extra delay for non-alphanumeric characters (punctuation, symbols, etc.)
      const delay = isAlphanumeric ? typingSpeed : typingSpeed * 2;

      const timer = setTimeout(() => {
        setDisplayText(fullText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      setIsTypingComplete(true);

      // Reanimate after specified delay
      setTimeout(() => {
        setDisplayText("");
        setCurrentIndex(0);
        setIsTypingComplete(false);
      }, reanimateDelay);
    }
  }, [currentIndex, isVisible, fullText, typingSpeed, reanimateDelay]);

  // Cursor blinking effect - always active when visible
  useEffect(() => {
    if (!isVisible) return;

    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, cursorBlinkSpeed);

    return () => clearInterval(cursorTimer);
  }, [isVisible, cursorBlinkSpeed]);

  const renderText = () => {
    const portfolioText = displayText.includes(".")
      ? displayText.split(".")[0]
      : displayText;
    const proText = displayText.includes(".")
      ? "." + displayText.split(".")[1]
      : "";

    // Calculate font sizes with size multiplier
    const mainFontSize = 3 * scale * sizeMultiplier;
    const proFontSize = 1.5 * scale * sizeMultiplier;

    // Calculate cursor dimensions based on the current text context
    let cursorHeight, cursorWidth;
    if (proText) {
      // If we're showing .pro text, cursor should match .pro size
      cursorHeight = 0.8 * proFontSize;
      cursorWidth = 0.08 * scale * sizeMultiplier;
    } else {
      // If we're still on PORTFOLIO text, cursor should match main size
      cursorHeight = 0.8 * mainFontSize;
      cursorWidth = 0.125 * scale * sizeMultiplier;
    }

    // Convert font weight to CSS style
    const getFontWeightStyle = () => {
      if (typeof fontWeight === "number") {
        return { fontWeight: fontWeight };
      }

      const weightMap = {
        thin: 100,
        extralight: 200,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
      };

      return { fontWeight: weightMap[fontWeight] || 400 };
    };

    const fontWeightStyle = getFontWeightStyle();

    return (
      <div
        className={`font-serif text-[var(--foreground)] leading-tight`}
        style={{
          fontSize: `${mainFontSize}rem`,
          ...fontWeightStyle,
        }}
      >
        {/* Use inline elements to ensure natural text flow and wrapping */}
        <span
          ref={portfolioRef}
          className={`relative z-10`}
          style={{
            fontSize: `${mainFontSize}rem`,
            letterSpacing: `${tracking}em`,
            ...fontWeightStyle,
          }}
        >
          {portfolioText}
        </span>
        <span
          style={{
            fontSize: `${proFontSize}rem`,
            letterSpacing: `${tracking}em`,
            ...fontWeightStyle,
          }}
        >
          {proText}
        </span>
        {/* Blinking cursor as inline element to follow natural text flow */}
        <span
          className={`inline-block bg-[var(--foreground)] transition-opacity duration-100`}
          style={{
            width: `${cursorWidth}rem`,
            height: `${cursorHeight}rem`,
            marginLeft: `${0.1 * scale * sizeMultiplier}rem`,
            display: showCursor ? "inline-block" : "none",
            opacity: showCursor ? 1 : 0,
            verticalAlign: "baseline",
          }}
        />
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Main text container with better responsive scaling */}
        <div className="flex items-center justify-center">{renderText()}</div>
      </div>
    </div>
  );
};

export default PortfolioProLogo;
