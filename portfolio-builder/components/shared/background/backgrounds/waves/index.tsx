import { registerBackground } from "../../editor/BackgroundRegistry";
import Waves from "@/components/Waves";

registerBackground({
    type: "waves",
    label: "Waves",
    fields: [
        { kind: "color", label: "Background Color", key: "wavesBackgroundColor", defaultValue: "transparent" },
        { kind: "slider", label: "Friction", key: "wavesFriction", defaultValue: 0.9, min: 0, max: 1, step: 0.01 },
        { kind: "color", label: "Line Color", key: "wavesLineColor", defaultValue: "#5227FF" },
        { kind: "slider", label: "Max Cursor Move", key: "wavesMaxCursorMove", defaultValue: 120, min: 0, max: 300, step: 1 },
        { kind: "slider", label: "Tension", key: "wavesTension", defaultValue: 0.01, min: 0, max: 0.1, step: 0.001 },
        { kind: "slider", label: "Wave Amp X", key: "wavesWaveAmpX", defaultValue: 40, min: 0, max: 100, step: 1 },
        { kind: "slider", label: "Wave Amp Y", key: "wavesWaveAmpY", defaultValue: 20, min: 0, max: 100, step: 1 },
        { kind: "slider", label: "Wave Speed X", key: "wavesWaveSpeedX", defaultValue: 0.02, min: 0, max: 0.1, step: 0.01 },
        { kind: "slider", label: "Wave Speed Y", key: "wavesWaveSpeedY", defaultValue: 0.01, min: 0, max: 0.1, step: 0.01 },
        { kind: "slider", label: "X Gap", key: "wavesXGap", defaultValue: 12, min: 0, max: 30, step: 1 },
        { kind: "slider", label: "Y Gap", key: "wavesYGap", defaultValue: 36, min: 0, max: 80, step: 1 },
    ],
    defaults: {
        type: "waves",
        wavesBackgroundColor: "transparent",
        wavesFriction: 0.9,
        wavesLineColor: "#5227FF",
        wavesMaxCursorMove: 120,
        wavesTension: 0.01,
        wavesWaveAmpX: 40,
        wavesWaveAmpY: 20,
        wavesWaveSpeedX: 0.02,
        wavesWaveSpeedY: 0.01,
        wavesXGap: 12,
        wavesYGap: 36,
        overlayColor: "#0a0a0a",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <Waves
                backgroundColor={background.wavesBackgroundColor || "transparent"}
                friction={background.wavesFriction ?? 0.9}
                lineColor={background.wavesLineColor || "#5227FF"}
                maxCursorMove={background.wavesMaxCursorMove ?? 120}
                tension={background.wavesTension ?? 0.01}
                waveAmpX={background.wavesWaveAmpX ?? 40}
                waveAmpY={background.wavesWaveAmpY ?? 20}
                waveSpeedX={background.wavesWaveSpeedX ?? 0.02}
                waveSpeedY={background.wavesWaveSpeedY ?? 0.01}
                xGap={background.wavesXGap ?? 12}
                yGap={background.wavesYGap ?? 36}
            />
        </div>
    ),
    supportsOverlay: true,
});