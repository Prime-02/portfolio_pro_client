import { registerBackground } from "../../editor/BackgroundRegistry";
import Noise from "@/components/Noise";

registerBackground({
    type: "noise",
    label: "Noise",
    fields: [
        { kind: "slider", label: "Pattern Alpha", key: "noisePatternAlpha", defaultValue: 15, min: 0, max: 200, step: 1 },
        { kind: "slider", label: "Pattern Refresh Interval", key: "noisePatternRefreshInterval", defaultValue: 2, min: 0, max: 20, step: 1 },
        { kind: "slider", label: "Pattern Scale X", key: "noisePatternScaleX", defaultValue: 1, min: 0, max: 5, step: 1 },
        { kind: "slider", label: "Pattern Scale Y", key: "noisePatternScaleY", defaultValue: 1, min: 0, max: 5, step: 1 },
        { kind: "slider", label: "Pattern Size", key: "noisePatternSize", defaultValue: 250, min: 0, max: 100, step: 1 },
    ],
    defaults: {
        type: "noise",
        noisePatternAlpha: 15,
        noisePatternRefreshInterval: 2,
        noisePatternScaleX: 1,
        noisePatternScaleY: 1,
        noisePatternSize: 250,
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <Noise
                patternAlpha={background.noisePatternAlpha ?? 15}
                patternRefreshInterval={background.noisePatternRefreshInterval ?? 2}
                patternScaleX={background.noisePatternScaleX ?? 1}
                patternScaleY={background.noisePatternScaleY ?? 1}
                patternSize={background.noisePatternSize ?? 250}
            />
        </div>
    ),
    supportsOverlay: true,
});
