// portfolio-builder/components/shared/background/renderer/SectionBackground.tsx

"use client";

import {
  getBackgroundModule,
  getBackgroundStyle,
  supportsOverlay,
} from "../editor/BackgroundRegistry";

// ── Import all background modules to trigger registration ─────────────────
import "../backgrounds/none";
import "../backgrounds/image";
import "../backgrounds/video";
import "../backgrounds/solid";
import "../backgrounds/gradient";
import "../backgrounds/antigravity";
import "../backgrounds/aurora";
import "../backgrounds/balatro";
import "../backgrounds/ballpit";
import "../backgrounds/beams";
import "../backgrounds/colorBends";
import "../backgrounds/darkVeil";
import "../backgrounds/dither";
import "../backgrounds/dotField";
import "../backgrounds/dotGrid";
import "../backgrounds/faultyTerminal";
import "../backgrounds/floatingLines";
import "../backgrounds/galaxy";
import "../backgrounds/gradientBlinds";
import "../backgrounds/gridScan";
import "../backgrounds/hyperspeed";
import "../backgrounds/laserFlow";
import "../backgrounds/letterGlitch";
import "../backgrounds/lightPillar";
import "../backgrounds/lightRays";
import "../backgrounds/lightfall";
import "../backgrounds/lineWaves";
import "../backgrounds/liquidChrome";
import "../backgrounds/liquidEther";
import "../backgrounds/mesh";
import "../backgrounds/noise";
import "../backgrounds/orb";
import "../backgrounds/particles";
import "../backgrounds/pixelBlast";
import "../backgrounds/pixelSnow";
import "../backgrounds/plasma";
import "../backgrounds/plasmaWave";
import "../backgrounds/prism";
import "../backgrounds/prismaticBurst";
import "../backgrounds/radar";
import "../backgrounds/rippleGrid";
import "../backgrounds/shapeGrid";
import "../backgrounds/sideRays";
import "../backgrounds/silk";
import "../backgrounds/softAurora";
import "../backgrounds/threads";
import "../backgrounds/waves";

import type { SectionBackground } from "../types/sectionBackground";

interface SectionBackgroundProps {
  background?: SectionBackground;
  className?: string;
}

/**
 * Unified background renderer for all portfolio sections.
 * Uses the background registry to resolve the correct renderer and styles
 * for any registered background type — no hardcoded types.
 */
export function SectionBackgroundRenderer({ background, className = "" }: SectionBackgroundProps) {
  if (!background || background.type === "none") {
    return null;
  }

  const module = getBackgroundModule(background.type);
  if (!module) {
    // Fallback: unknown type, render nothing
    console.warn(`[SectionBackgroundRenderer] Unknown background type: ${background.type}`);
    return null;
  }

  // Resolve CSS styles (for solid, gradient, image)
  const cssStyle = module.getStyle ? module.getStyle(background) : {};

  // Resolve overlay
  const overlayOpacity = background.overlayOpacity ?? 0;
  const showOverlay = module.supportsOverlay && overlayOpacity > 0;

  return (
    <div className={`absolute inset-0 w-full h-full z-0 ${className}`} style={cssStyle}>
      {module.renderer && (
        <div className="absolute inset-0 w-full h-full">
          <module.renderer background={background} />
        </div>
      )}

      {showOverlay && (
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            backgroundColor: background.overlayColor || "var(--pb-background)",
            opacity: overlayOpacity / 100,
          }}
        />
      )}
    </div>
  );
}