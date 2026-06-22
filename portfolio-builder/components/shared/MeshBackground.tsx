// portfolio-builder/components/sections/hero/renderer-components/MeshBackground.tsx

interface MeshBackgroundProps {
    color1: string;
    color2: string;
    color3: string;
    color4: string;
    speed: number;
    blur: number;
    size: number;
    base: string;
    /** Global opacity multiplier applied to all orbs (0–1, default 1) */
    opacity?: number;
}

export function MeshBackground({
    color1,
    color2,
    color3,
    color4,
    speed,
    blur,
    size,
    base,
    opacity = 1,
}: MeshBackgroundProps) {
    // vmin keeps orbs circular — % resolves differently on width vs height axes
    const s = `${size}vmin`;
    const dur = (n: number) => `${speed * n}s`;

    // Blur stays in px — vmin would produce enormous values (e.g. 80vmin ≈ 864px on 1080p)
    const b = (multiplier = 1) => `blur(${blur * multiplier}px)`;

    // Per-orb base opacities multiplied by the global multiplier
    const o = (base: number) => Math.min(1, Math.max(0, base * opacity));

    const orbBase = {
        position: "absolute" as const,
        borderRadius: "50%",
        willChange: "transform",
    };

    return (
        <div className="absolute inset-0 z-0 overflow-hidden" style={{ backgroundColor: base }}>
            <style>{`
        @keyframes mesh-drift-1 {
          0%,100% { transform: translate(0%, 0%) scale(1); }
          33%      { transform: translate(15%, -20%) scale(1.1); }
          66%      { transform: translate(-10%, 15%) scale(0.95); }
        }
        @keyframes mesh-drift-2 {
          0%,100% { transform: translate(0%, 0%) scale(1); }
          33%      { transform: translate(-20%, 10%) scale(1.05); }
          66%      { transform: translate(18%, -15%) scale(1.1); }
        }
        @keyframes mesh-drift-3 {
          0%,100% { transform: translate(0%, 0%) scale(1); }
          40%      { transform: translate(12%, 18%) scale(0.9); }
          70%      { transform: translate(-15%, -12%) scale(1.08); }
        }
        @keyframes mesh-drift-4 {
          0%,100% { transform: translate(0%, 0%) scale(1); }
          25%      { transform: translate(-8%, 20%) scale(1.12); }
          75%      { transform: translate(20%, -8%) scale(0.92); }
        }
      `}</style>

            <div style={{ ...orbBase, top: "-10%", left: "-10%", width: s, height: s, background: color1, filter: b(1), opacity: o(0.85), animation: `mesh-drift-1 ${dur(1)} ease-in-out infinite` }} />
            <div style={{ ...orbBase, bottom: "-10%", right: "-10%", width: s, height: s, background: color2, filter: b(1), opacity: o(0.80), animation: `mesh-drift-2 ${dur(1.3)} ease-in-out infinite` }} />
            <div style={{ ...orbBase, top: "20%", right: "5%", width: `calc(${s} * 0.8)`, height: `calc(${s} * 0.8)`, background: color3, filter: b(0.9), opacity: o(0.70), animation: `mesh-drift-3 ${dur(0.9)} ease-in-out infinite` }} />
            <div style={{ ...orbBase, top: "40%", left: "10%", width: `calc(${s} * 0.7)`, height: `calc(${s} * 0.7)`, background: color4, filter: b(0.8), opacity: o(0.65), animation: `mesh-drift-4 ${dur(1.1)} ease-in-out infinite` }} />
        </div>
    );
}