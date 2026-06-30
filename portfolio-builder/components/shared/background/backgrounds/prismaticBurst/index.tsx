import { registerBackground } from "../../editor/BackgroundRegistry";
import PrismaticBurst from "@/components/PrismaticBurst";

registerBackground({
    type: "prismaticBurst",
    label: "PrismaticBurst",
    fields: [
        { kind: "dropdown", label: "Animation Type", key: "prismaticBurstAnimationType", defaultValue: "rotate3d", options: [{ id: "rotate3d", code: "Rotate 3D" }, { id: "rotate", code: "Rotate" }, { id: "hover", code: "Hover" }] },
        {
            kind: "group", label: "Colors", fields: [
                { kind: "color", label: "Color 1", key: "prismaticBurstColors1", defaultValue: "#5227FF" },
                { kind: "color", label: "Color 2", key: "prismaticBurstColors2", defaultValue: "#FF9FFC" },
                { kind: "color", label: "Color 3", key: "prismaticBurstColors3", defaultValue: "#7cff67" }
            ]
        },
        { kind: "slider", label: "Distort", key: "prismaticBurstDistort", defaultValue: 0, min: 0, max: 1, step: 0.1 },
        { kind: "slider", label: "Hover Dampness", key: "prismaticBurstHoverDampness", defaultValue: 0, min: 0, max: 1, step: 0.1 },
        { kind: "slider", label: "Intensity", key: "prismaticBurstIntensity", defaultValue: 2, min: 0, max: 5, step: 1 },
        { kind: "slider", label: "Ray Count", key: "prismaticBurstRayCount", defaultValue: 0, min: 0, max: 20, step: 1 },
        { kind: "slider", label: "Speed", key: "prismaticBurstSpeed", defaultValue: 0.5, min: 0, max: 2, step: 0.1 },
    ],
    defaults: {
        type: "prismaticBurst",
        prismaticBurstAnimationType: "rotate3d",
        prismaticBurstColors1: "#5227FF",
        prismaticBurstColors2: "#FF9FFC",
        prismaticBurstColors3: "#7cff67",
        prismaticBurstDistort: 0,
        prismaticBurstHoverDampness: 0,
        prismaticBurstIntensity: 2,
        prismaticBurstRayCount: 0,
        prismaticBurstSpeed: 0.5,
        overlayColor: "#0a0a0a",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <PrismaticBurst
                animationType={background.prismaticBurstAnimationType || "rotate3d"}
                colors={[background.prismaticBurstColors1 || '#5227FF', background.prismaticBurstColors2 || '#FF9FFC', background.prismaticBurstColors3 || '#7cff67']}
                distort={background.prismaticBurstDistort ?? 0}
                hoverDampness={background.prismaticBurstHoverDampness ?? 0}
                intensity={background.prismaticBurstIntensity ?? 2}
                rayCount={background.prismaticBurstRayCount ?? 0}
                speed={background.prismaticBurstSpeed ?? 0.5}
            />
        </div>
    ),
    supportsOverlay: true,
});