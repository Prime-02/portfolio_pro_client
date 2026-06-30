import { registerBackground } from "../../editor/BackgroundRegistry";
import Radar from "@/components/Radar";

registerBackground({
    type: "radar",
    label: "Radar",
    fields: [
        { kind: "color", label: "Background Color", key: "radarBackgroundColor", defaultValue: "#000000" },
        { kind: "slider", label: "Brightness", key: "radarBrightness", defaultValue: 1, min: 0, max: 3, step: 1 },
        { kind: "color", label: "Color", key: "radarColor", defaultValue: "#6a0ac5" },
        { kind: "checkbox", label: "Enable Mouse Interaction", key: "radarEnableMouseInteraction", defaultValue: true },
        { kind: "slider", label: "Falloff", key: "radarFalloff", defaultValue: 2, min: 0, max: 3, step: 1 },
        { kind: "slider", label: "Mouse Influence", key: "radarMouseInfluence", defaultValue: 0.1, min: 0, max: 1, step: 0.1 },
        { kind: "slider", label: "Ring Count", key: "radarRingCount", defaultValue: 10, min: 0, max: 30, step: 1 },
        { kind: "slider", label: "Ring Thickness", key: "radarRingThickness", defaultValue: 0.05, min: 0, max: 0.3, step: 0.05 },
        { kind: "slider", label: "Scale", key: "radarScale", defaultValue: 0.5, min: 0, max: 3, step: 0.1 },
        { kind: "slider", label: "Speed", key: "radarSpeed", defaultValue: 0.1, min: 0, max: 5, step: 0.1 },
        { kind: "slider", label: "Spoke Count", key: "radarSpokeCount", defaultValue: 10, min: 0, max: 36, step: 1 },
        { kind: "slider", label: "Spoke Thickness", key: "radarSpokeThickness", defaultValue: 0.2, min: 0, max: 0.2, step: 0.05 },
        { kind: "slider", label: "Sweep Lobes", key: "radarSweepLobes", defaultValue: 1, min: 0, max: 6, step: 1 },
        { kind: "slider", label: "Sweep Speed", key: "radarSweepSpeed", defaultValue: 0.1, min: 0, max: 5, step: 0.1 },
        { kind: "slider", label: "Sweep Width", key: "radarSweepWidth", defaultValue: 20, min: 0, max: 20, step: 1 },
    ],
    defaults: {
        type: "radar",
        radarBackgroundColor: "#000000",
        radarBrightness: 1,
        radarColor: "#6a0ac5",
        radarEnableMouseInteraction: true,
        radarFalloff: 2,
        radarMouseInfluence: 0.1,
        radarRingCount: 10,
        radarRingThickness: 0.05,
        radarScale: 0.5,
        radarSpeed: 0.1,
        radarSpokeCount: 10,
        radarSpokeThickness: 0.2,
        radarSweepLobes: 1,
        radarSweepSpeed: 0.1,
        radarSweepWidth: 20,
        overlayColor: "#0a0a0a",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <Radar
                backgroundColor={background.radarBackgroundColor || "#000000"}
                brightness={background.radarBrightness ?? 1}
                color={background.radarColor || "#6a0ac5"}
                enableMouseInteraction={background.radarEnableMouseInteraction ?? true}
                falloff={background.radarFalloff ?? 2}
                mouseInfluence={background.radarMouseInfluence ?? 0.1}
                ringCount={background.radarRingCount ?? 10}
                ringThickness={background.radarRingThickness ?? 0.05}
                scale={background.radarScale ?? 0.5}
                speed={background.radarSpeed ?? 0.1}
                spokeCount={background.radarSpokeCount ?? 10}
                spokeThickness={background.radarSpokeThickness ?? 0.2}
                sweepLobes={background.radarSweepLobes ?? 1}
                sweepSpeed={background.radarSweepSpeed ?? 0.1}
                sweepWidth={background.radarSweepWidth ?? 20}
            />
        </div>
    ),
    supportsOverlay: true,
});