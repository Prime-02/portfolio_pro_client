// portfolio-builder/components/shared/SectionBackground.tsx

"use client";

import { getBackgroundStyle, getOverlayStyle, needsDedicatedBackground } from "@/portfolio-builder/lib/sectionBackground";
import { MeshBackground } from "@/portfolio-builder/components/shared/MeshBackground";
import { ParticlesBackground } from "@/portfolio-builder/components/shared/ParticlesBackground";
import type { SectionBackground } from "@/portfolio-builder/types/sectionBackground";

interface SectionBackgroundProps {
    background?: SectionBackground;
    className?: string;
}

/**
 * Unified background renderer for all portfolio sections.
 * Handles: none, solid, gradient, image, video, mesh, particles
 * with automatic overlay support for image/video/mesh/particles.
 */
export function SectionBackgroundRenderer({ background, className = "" }: SectionBackgroundProps) {
    
    if (!background || background.type === "none") {
        return null;
    }

    const bgStyle = getBackgroundStyle(background);
    const overlayStyle = getOverlayStyle(background);

    return (
        <div className={`absolute inset-0 z-0 ${className}`} style={bgStyle}>
            {/* Dedicated animated backgrounds */}
            {background.type === "mesh" && (
                <MeshBackground
                    color1={background.meshColor1 || "#7c3aed"}
                    color2={background.meshColor2 || "#2563eb"}
                    color3={background.meshColor3 || "#0891b2"}
                    color4={background.meshColor4 || "var(--pb-background)"}
                    speed={background.meshSpeed ?? 6}
                    blur={background.meshBlur ?? 80}
                    size={background.meshSize ?? 60}
                    base={background.meshBase || "#050510"}
                    opacity={background.meshOpacity ?? 1}
                />
            )}

            {background.type === "particles" && (
                <ParticlesBackground
                    color={background.particleColor || "var(--pb-foreground)"}
                    count={background.particleCount ?? 80}
                    size={background.particleSize ?? 2}
                    speed={background.particleSpeed ?? 0.5}
                    opacity={background.particleOpacity ?? 0.6}
                    lines={background.particleLines ?? true}
                    lineDist={background.particleLineDist ?? 120}
                    bgColor={background.particleBg || "var(--pb-background)"}
                    overlayColor={background.overlayColor || "var(--pb-background)"}
                    overlayOpacity={background.overlayOpacity ?? 0}
                />
            )}

            {background.type === "video" && background.videoUrl && (
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: background.backgroundPosition ?? "center" }}
                    src={background.videoUrl}
                />
            )}

            {/* Overlay layer — rendered last so it sits above background but below content */}
            {overlayStyle && (
                <div
                    className="absolute inset-0 z-[1] pointer-events-none"
                    style={overlayStyle}
                />
            )}
        </div>
    );
}