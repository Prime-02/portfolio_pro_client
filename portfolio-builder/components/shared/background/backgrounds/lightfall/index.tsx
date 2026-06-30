import { registerBackground } from "../../editor/BackgroundRegistry";
import Lightfall from "@/components/Lightfall";

registerBackground({
    type: "lightfall",
    label: "Lightfall",
    fields: [
        { kind: "color", label: "Background Color", key: "lightfallBackgroundColor", defaultValue: "#0A29FF" },
        { kind: "slider", label: "Background Glow", key: "lightfallBackgroundGlow", defaultValue: 0.5, min: 0, max: 5, step: 0.1 },
        {
            kind: "group", label: "Colors", fields: [
                { kind: "color", label: "Color 1", key: "lightfallColors1", defaultValue: "#A6C8FF" },
                { kind: "color", label: "Color 2", key: "lightfallColors2", defaultValue: "#5227FF" },
                { kind: "color", label: "Color 3", key: "lightfallColors3", defaultValue: "#FF9FFC" }
            ]
        },
        { kind: "slider", label: "Density", key: "lightfallDensity", defaultValue: 0.6, min: 0, max: 2, step: 0.1 },
        { kind: "slider", label: "Glow", key: "lightfallGlow", defaultValue: 1, min: 0, max: 3, step: 0.5 },
        { kind: "checkbox", label: "Mouse Interaction", key: "lightfallMouseInteraction", defaultValue: true },
        { kind: "slider", label: "Mouse Radius", key: "lightfallMouseRadius", defaultValue: 1, min: 0, max: 100, step: 1 },
        { kind: "slider", label: "Mouse Strength", key: "lightfallMouseStrength", defaultValue: 0.5, min: 0, max: 10, step: 0.1 },
        { kind: "slider", label: "Opacity", key: "lightfallOpacity", defaultValue: 1, min: 0, max: 1, step: 0.05 },
        { kind: "slider", label: "Speed", key: "lightfallSpeed", defaultValue: 0.5, min: 0, max: 10, step: 0.1 },
        { kind: "slider", label: "Streak Count", key: "lightfallStreakCount", defaultValue: 2, min: 0, max: 100, step: 1 },
        { kind: "slider", label: "Streak Length", key: "lightfallStreakLength", defaultValue: 1, min: 0, max: 20, step: 1 },
        { kind: "slider", label: "Streak Width", key: "lightfallStreakWidth", defaultValue: 1, min: 0, max: 100, step: 1 },
        { kind: "slider", label: "Twinkle", key: "lightfallTwinkle", defaultValue: 1, min: 0, max: 5, step: 1 },
        { kind: "slider", label: "Zoom", key: "lightfallZoom", defaultValue: 3, min: 0, max: 10, step: 0.5 },
    ],
    defaults: {
        type: "lightfall",
        lightfallBackgroundColor: "#0A29FF",
        lightfallBackgroundGlow: 0.5,
        lightfallColors1: "#A6C8FF",
        lightfallColors2: "#5227FF",
        lightfallColors3: "#FF9FFC",
        lightfallDensity: 0.6,
        lightfallGlow: 1,
        lightfallMouseInteraction: true,
        lightfallMouseRadius: 1,
        lightfallMouseStrength: 0.5,
        lightfallOpacity: 1,
        lightfallSpeed: 0.5,
        lightfallStreakCount: 2,
        lightfallStreakLength: 1,
        lightfallStreakWidth: 1,
        lightfallTwinkle: 1,
        lightfallZoom: 3,
        overlayColor: "#0a0a0a",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <Lightfall
                className=""
                dpr={typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1}
                mixBlendMode="normal"
                backgroundColor={background.lightfallBackgroundColor || "#0A29FF"}
                backgroundGlow={background.lightfallBackgroundGlow ?? 0.5}
                colors={[background.lightfallColors1 || '#A6C8FF', background.lightfallColors2 || '#5227FF', background.lightfallColors3 || '#FF9FFC']}
                density={background.lightfallDensity ?? 0.6}
                glow={background.lightfallGlow ?? 1}
                mouseInteraction={background.lightfallMouseInteraction ?? true}
                mouseRadius={background.lightfallMouseRadius ?? 1}
                mouseStrength={background.lightfallMouseStrength ?? 0.5}
                opacity={background.lightfallOpacity ?? 1}
                speed={background.lightfallSpeed ?? 0.5}
                streakCount={background.lightfallStreakCount ?? 2}
                streakLength={background.lightfallStreakLength ?? 1}
                streakWidth={background.lightfallStreakWidth ?? 1}
                twinkle={background.lightfallTwinkle ?? 1}
                zoom={background.lightfallZoom ?? 3}
            />
        </div>
    ),
    supportsOverlay: true,
});