// portfolio-builder/components/sections/hero/renderer-components/useTypewriter.ts

"use client";

import { useState, useEffect, useRef } from "react";

interface UseTypewriterOptions {
  text: string;
  speed?: number; // ms per character
  enabled?: boolean;
  delay?: number; // ms before starting
}

export function useTypewriter({
  text,
  speed = 50,
  enabled = true,
  delay = 0,
}: UseTypewriterOptions): { displayed: string; isDone: boolean } {
  const [displayed, setDisplayed] = useState(enabled ? "" : text);
  const [isDone, setIsDone] = useState(!enabled);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text);
      setIsDone(true);
      return;
    }

    // Reset when text or settings change
    setDisplayed("");
    setIsDone(false);
    indexRef.current = 0;

    const startTimeout = setTimeout(() => {
      const tick = () => {
        indexRef.current += 1;
        setDisplayed(text.slice(0, indexRef.current));

        if (indexRef.current < text.length) {
          timeoutRef.current = setTimeout(tick, speed);
        } else {
          setIsDone(true);
        }
      };

      timeoutRef.current = setTimeout(tick, speed);
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, speed, enabled, delay]);

  return { displayed, isDone };
}
