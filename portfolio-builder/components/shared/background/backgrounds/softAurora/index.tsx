import { registerBackground } from "../../editor/BackgroundRegistry";
import SoftAurora from "@/components/SoftAurora";

registerBackground({
    type: "softAurora",
    label: "SoftAurora",
    fields: [
        { kind: "slider", label: "Band Height", key: "softAuroraBandHeight", defaultValue: 0.5, min: 0, max: 1, step: 0.1 },
        { kind: "slider", label: "Band Spread", key: "softAuroraBandSpread", defaultValue: 1, min: 0, max: 3, step: 0.1 },
        { kind: "slider", label: "Brightness", key: "softAuroraBrightness", defaultValue: 1, min: 0, max: 3, step: 1 },
        { kind: "color", label: "Color1", key: "softAuroraColor1", defaultValue: "#f7f7f7" },
        { kind: "color", label: "Color2", key: "softAuroraColor2", defaultValue: "#e100ff" },
        { kind: "slider", label: "Color Speed", key: "softAuroraColorSpeed", defaultValue: 1, min: 0, max: 5, step: 0.1 },
        { kind: "checkbox", label: "Enable Mouse Interaction", key: "softAuroraEnableMouseInteraction", defaultValue: true },
        { kind: "slider", label: "Layer Offset", key: "softAuroraLayerOffset", defaultValue: 0, min: 0, max: 1, step: 0.1 },
        { kind: "slider", label: "Mouse Influence", key: "softAuroraMouseInfluence", defaultValue: 0.25, min: 0, max: 1, step: 0.1 },
        { kind: "slider", label: "Noise Amplitude", key: "softAuroraNoiseAmplitude", defaultValue: 1, min: 0, max: 10, step: 1 },
        { kind: "slider", label: "Noise Frequency", key: "softAuroraNoiseFrequency", defaultValue: 2.5, min: 0, max: 10, step: 0.1 },
        { kind: "slider", label: "Octave Decay", key: "softAuroraOctaveDecay", defaultValue: 0.1, min: 0, max: 0.5, step: 0.01 },
        { kind: "slider", label: "Scale", key: "softAuroraScale", defaultValue: 1.5, min: 0, max: 3, step: 0.1 },
        { kind: "slider", label: "Speed", key: "softAuroraSpeed", defaultValue: 0.6, min: 0, max: 5, step: 0.1 },
    ],
    defaults: {
        type: "softAurora",
        softAuroraBandHeight: 0.5,
        softAuroraBandSpread: 1,
        softAuroraBrightness: 1,
        softAuroraColor1: "#f7f7f7",
        softAuroraColor2: "#e100ff",
        softAuroraColorSpeed: 1,
        softAuroraEnableMouseInteraction: true,
        softAuroraLayerOffset: 0,
        softAuroraMouseInfluence: 0.25,
        softAuroraNoiseAmplitude: 1,
        softAuroraNoiseFrequency: 2.5,
        softAuroraOctaveDecay: 0.1,
        softAuroraScale: 1.5,
        softAuroraSpeed: 0.6,
        overlayColor: "#0a0a0a",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <SoftAurora
                bandHeight={background.softAuroraBandHeight ?? 0.5}
                bandSpread={background.softAuroraBandSpread ?? 1}
                brightness={background.softAuroraBrightness ?? 1}
                color1={background.softAuroraColor1 || "#f7f7f7"}
                color2={background.softAuroraColor2 || "#e100ff"}
                colorSpeed={background.softAuroraColorSpeed ?? 1}
                enableMouseInteraction={background.softAuroraEnableMouseInteraction ?? true}
                layerOffset={background.softAuroraLayerOffset ?? 0}
                mouseInfluence={background.softAuroraMouseInfluence ?? 0.25}
                noiseAmplitude={background.softAuroraNoiseAmplitude ?? 1}
                noiseFrequency={background.softAuroraNoiseFrequency ?? 2.5}
                octaveDecay={background.softAuroraOctaveDecay ?? 0.1}
                scale={background.softAuroraScale ?? 1.5}
                speed={background.softAuroraSpeed ?? 0.6}
            />
        </div>
    ),
    supportsOverlay: true,
});