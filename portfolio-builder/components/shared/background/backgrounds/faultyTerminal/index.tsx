import { registerBackground } from "../../editor/BackgroundRegistry";
import FaultyTerminal from "@/components/FaultyTerminal";

registerBackground({
    type: "faultyTerminal",
    label: "FaultyTerminal",
    fields: [
        { kind: "slider", label: "Brightness", key: "faultyTerminalBrightness", defaultValue: 1, min: 0, max: 5, step: 1 },
        { kind: "slider", label: "Chromatic Aberration", key: "faultyTerminalChromaticAberration", defaultValue: 0, min: -1, max: 1, step: 1 },
        { kind: "slider", label: "Curvature", key: "faultyTerminalCurvature", defaultValue: 0.2, min: 0, max: 2, step: 0.1 },
        { kind: "slider", label: "Digit Size", key: "faultyTerminalDigitSize", defaultValue: 1.5, min: 0, max: 100, step: 1 },
        { kind: "slider", label: "Dither", key: "faultyTerminalDither", defaultValue: 0, min: 0, max: 2, step: 0.1 },
        { kind: "slider", label: "Flicker Amount", key: "faultyTerminalFlickerAmount", defaultValue: 1, min: 0, max: 10, step: 1 },
        { kind: "slider", label: "Glitch Amount", key: "faultyTerminalGlitchAmount", defaultValue: 1, min: 0, max: 10, step: 1 },
        { kind: "checkbox", label: "Mouse React", key: "faultyTerminalMouseReact", defaultValue: true },
        { kind: "slider", label: "Mouse Strength", key: "faultyTerminalMouseStrength", defaultValue: 0.2, min: 0, max: 10, step: 0.1 },
        { kind: "slider", label: "Noise Amp", key: "faultyTerminalNoiseAmp", defaultValue: 0, min: 0, max: 5, step: 1 },
        { kind: "slider", label: "Scale", key: "faultyTerminalScale", defaultValue: 1, min: 0, max: 5, step: 1 },
        { kind: "slider", label: "Scanline Intensity", key: "faultyTerminalScanlineIntensity", defaultValue: 0.3, min: 0, max: 10, step: 0.1 },
        { kind: "color", label: "Tint", key: "faultyTerminalTint", defaultValue: "#ffffff" },
    ],
    defaults: {
        type: "faultyTerminal",
        faultyTerminalBrightness: 1,
        faultyTerminalChromaticAberration: 0,
        faultyTerminalCurvature: 0.2,
        faultyTerminalDigitSize: 1.5,
        faultyTerminalDither: 0,
        faultyTerminalFlickerAmount: 1,
        faultyTerminalGlitchAmount: 1,
        faultyTerminalMouseReact: true,
        faultyTerminalMouseStrength: 0.2,
        faultyTerminalNoiseAmp: 0,
        faultyTerminalScale: 1,
        faultyTerminalScanlineIntensity: 0.3,
        faultyTerminalTint: "#ffffff",
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <FaultyTerminal
                className=""
                style={{}}
                brightness={background.faultyTerminalBrightness ?? 1}
                chromaticAberration={background.faultyTerminalChromaticAberration ?? 0}
                curvature={background.faultyTerminalCurvature ?? 0.2}
                digitSize={background.faultyTerminalDigitSize ?? 1.5}
                dither={background.faultyTerminalDither ?? 0}
                flickerAmount={background.faultyTerminalFlickerAmount ?? 1}
                glitchAmount={background.faultyTerminalGlitchAmount ?? 1}
                mouseReact={background.faultyTerminalMouseReact ?? true}
                mouseStrength={background.faultyTerminalMouseStrength ?? 0.2}
                noiseAmp={background.faultyTerminalNoiseAmp ?? 0}
                scale={background.faultyTerminalScale ?? 1}
                scanlineIntensity={background.faultyTerminalScanlineIntensity ?? 0.3}
                tint={background.faultyTerminalTint || "#ffffff"}
            />
        </div>
    ),
    supportsOverlay: true,
});