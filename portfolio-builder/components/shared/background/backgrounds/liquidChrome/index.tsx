import { registerBackground } from "../../editor/BackgroundRegistry";
import LiquidChrome from "@/components/LiquidChrome";

registerBackground({
    type: "liquidChrome",
    label: "LiquidChrome",
    fields: [
        { kind: "slider", label: "Amplitude", key: "liquidChromeAmplitude", defaultValue: 0.3, min: 0, max: 1, step: 0.1 },
        { kind: "slider", label: "Frequency X", key: "liquidChromeFrequencyX", defaultValue: 3, min: 0, max: 10, step: 1 },
        { kind: "slider", label: "Frequency Y", key: "liquidChromeFrequencyY", defaultValue: 3, min: 0, max: 10, step: 1 },
        { kind: "checkbox", label: "Interactive", key: "liquidChromeInteractive", defaultValue: true },
        { kind: "slider", label: "Speed", key: "liquidChromeSpeed", defaultValue: 0.2, min: 0, max: 2, step: 0.1 },
    ],
    defaults: {
        type: "liquidChrome",
        liquidChromeAmplitude: 0.3,
        liquidChromeFrequencyX: 3,
        liquidChromeFrequencyY: 3,
        liquidChromeInteractive: true,
        liquidChromeSpeed: 0.2,
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <LiquidChrome
                amplitude={background.liquidChromeAmplitude ?? 0.3}
                frequencyX={background.liquidChromeFrequencyX ?? 3}
                frequencyY={background.liquidChromeFrequencyY ?? 3}
                interactive={background.liquidChromeInteractive ?? true}
                speed={background.liquidChromeSpeed ?? 0.2}
            />
        </div>
    ),
    supportsOverlay: true,
});