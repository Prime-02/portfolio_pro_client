import { registerBackground } from "../../editor/BackgroundRegistry";
import DarkVeil from "@/components/DarkVeil";

registerBackground({
    type: "darkVeil",
    label: "Dark Veil",
    fields: [
        { kind: "slider", label: "Hue Shift", key: "darkVeilHueShift", defaultValue: 0, min: -180, max: 180, step: 1 },
        { kind: "slider", label: "Noise", key: "darkVeilNoiseIntensity", defaultValue: 0, min: 0, max: 1, step: 0.01 },
        { kind: "slider", label: "Scanline", key: "darkVeilScanlineIntensity", defaultValue: 0, min: 0, max: 1, step: 0.01 },
        { kind: "slider", label: "Speed", key: "darkVeilSpeed", defaultValue: 0.5, min: 0, max: 2, step: 0.05 },
        { kind: "slider", label: "Scanline Frequency", key: "darkVeilScanlineFrequency", defaultValue: 0, min: 0, max: 10, step: 0.5 },
        { kind: "slider", label: "Warp", key: "darkVeilWarpAmount", defaultValue: 0, min: 0, max: 2, step: 0.05 },
        { kind: "slider", label: "Resolution Scale", key: "darkVeilResolutionScale", defaultValue: 1, min: 0.5, max: 2, step: 0.1 },
    ],
    defaults: {
        type: "darkVeil",
        darkVeilHueShift: 0,
        darkVeilNoiseIntensity: 0,
        darkVeilScanlineIntensity: 0,
        darkVeilSpeed: 0.5,
        darkVeilScanlineFrequency: 0,
        darkVeilWarpAmount: 0,
        darkVeilResolutionScale: 1,
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <DarkVeil
            hueShift={background.darkVeilHueShift ?? 0}
            noiseIntensity={background.darkVeilNoiseIntensity ?? 0}
            scanlineIntensity={background.darkVeilScanlineIntensity ?? 0}
            speed={background.darkVeilSpeed ?? 0.5}
            scanlineFrequency={background.darkVeilScanlineFrequency ?? 0}
            warpAmount={background.darkVeilWarpAmount ?? 0}
            resolutionScale={background.darkVeilResolutionScale ?? 1}
        />
    ),
    supportsOverlay: false,
});
