import { registerBackground } from "../../editor/BackgroundRegistry";
import Threads from "@/components/Threads";

registerBackground({
    type: "threads",
    label: "Threads",
    fields: [
        { kind: "slider", label: "Amplitude", key: "threadsAmplitude", defaultValue: 1, min: 0, max: 3, step: 0.1 },
        { kind: "text", label: "Color", key: "threadsColor", defaultValue: "[0.32,0.15,1]", placeholder: "JSON array" },
        { kind: "slider", label: "Distance", key: "threadsDistance", defaultValue: 0, min: 0, max: 2, step: 0.1 },
        { kind: "checkbox", label: "Enable Mouse Interaction", key: "threadsEnableMouseInteraction", defaultValue: true },
    ],
    defaults: {
        type: "threads",
        threadsAmplitude: 1,
        threadsColor: [0.32, 0.15, 1],
        threadsDistance: 0,
        threadsEnableMouseInteraction: true,
        overlayColor: "#0a0a0a",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <Threads
                amplitude={background.threadsAmplitude ?? 1}
                color={background.threadsColor ?? [0.32, 0.15, 1]}
                distance={background.threadsDistance ?? 0}
                enableMouseInteraction={background.threadsEnableMouseInteraction ?? true}
            />
        </div>
    ),
    supportsOverlay: true,
});