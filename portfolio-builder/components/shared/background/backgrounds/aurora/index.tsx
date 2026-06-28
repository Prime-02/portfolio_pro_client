import { registerBackground } from "../../editor/BackgroundRegistry";
import Aurora from "@/components/Aurora";

registerBackground({
    type: "aurora",
    label: "Aurora",
    fields: [
        {
            kind: "group",
            label: "Colors",
            fields: [
                { kind: "color", label: "Color Stop 1", key: "auroraColor1", defaultValue: "#5227FF" },
                { kind: "color", label: "Color Stop 2", key: "auroraColor2", defaultValue: "#7cff67" },
                { kind: "color", label: "Color Stop 3", key: "auroraColor3", defaultValue: "#5227FF" },
            ],
        },
        { kind: "slider", label: "Amplitude", key: "auroraAmplitude", defaultValue: 1.6, min: 0, max: 5, step: 0.1 },
        { kind: "slider", label: "Blend", key: "auroraBlend", defaultValue: 1, min: 0, max: 2, step: 0.1 },
    ],
    defaults: {
        type: "aurora",
        auroraColor1: "#5227FF",
        auroraColor2: "#7cff67",
        auroraColor3: "#5227FF",
        auroraAmplitude: 1.6,
        auroraBlend: 1,
        overlayColor: "#0a0a0a",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <Aurora
            colorStops={[
                background.auroraColor1 || "#5227FF",
                background.auroraColor2 || "#7cff67",
                background.auroraColor3 || "#5227FF",
            ]}
            amplitude={background.auroraAmplitude ?? 1.6}
            blend={background.auroraBlend ?? 1}
        />
    ),
    supportsOverlay: false,
});
