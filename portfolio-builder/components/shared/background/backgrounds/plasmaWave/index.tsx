import { registerBackground } from "../../editor/BackgroundRegistry";
import PlasmaWave from "@/components/PlasmaWave";

registerBackground({
    type: "plasmaWave",
    label: "PlasmaWave",
    fields: [
        { kind: "slider", label: "Bend1", key: "plasmaWaveBend1", defaultValue: 1, min: 0, max: 3, step: 1 },
        { kind: "slider", label: "Bend2", key: "plasmaWaveBend2", defaultValue: 0.5, min: 0, max: 3, step: 0.1 },
        {
            kind: "group", label: "Colors", fields: [
                { kind: "color", label: "Color 1", key: "plasmaWaveColors1", defaultValue: "#A855F7" },
                { kind: "color", label: "Color 2", key: "plasmaWaveColors2", defaultValue: "#06B6D4" }
            ]
        },
        { kind: "slider", label: "Dir2", key: "plasmaWaveDir2", defaultValue: 1, min: -1, max: 1, step: 1 },
        { kind: "slider", label: "Focal Length", key: "plasmaWaveFocalLength", defaultValue: 0.8, min: 0, max: 2, step: 0.01 },
        { kind: "slider", label: "Speed1", key: "plasmaWaveSpeed1", defaultValue: 0.05, min: 0, max: 0.2, step: 0.01 },
        { kind: "slider", label: "Speed2", key: "plasmaWaveSpeed2", defaultValue: 0.05, min: 0, max: 0.2, step: 0.01 },
    ],
    defaults: {
        type: "plasmaWave",
        plasmaWaveBend1: 1,
        plasmaWaveBend2: 0.5,
        plasmaWaveColors1: "#A855F7",
        plasmaWaveColors2: "#06B6D4",
        plasmaWaveDir2: 1,
        plasmaWaveFocalLength: 0.8,
        plasmaWaveSpeed1: 0.05,
        plasmaWaveSpeed2: 0.05,
        overlayColor: "#0a0a0a",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <PlasmaWave
                bend1={background.plasmaWaveBend1 ?? 1}
                bend2={background.plasmaWaveBend2 ?? 0.5}
                colors={[background.plasmaWaveColors1 || '#A855F7', background.plasmaWaveColors2 || '#06B6D4']}
                dir2={background.plasmaWaveDir2 ?? 1}
                focalLength={background.plasmaWaveFocalLength ?? 0.8}
                speed1={background.plasmaWaveSpeed1 ?? 0.05}
                speed2={background.plasmaWaveSpeed2 ?? 0.05}
            />
        </div>
    ),
    supportsOverlay: true,
});