import { registerBackground } from "../../editor/BackgroundRegistry";
import Threads from "@/components/Threads";

registerBackground({
    type: "threads",
    label: "Threads",
    fields: [
        { kind: "slider", label: "Amplitude", key: "threadsAmplitude", defaultValue: 1, min: 0, max: 3, step: 0.1 },
        { kind: "color", label: "Color", key: "threadsColor", defaultValue: "#5226FF" },
        { kind: "slider", label: "Distance", key: "threadsDistance", defaultValue: 0, min: 0, max: 2, step: 0.1 },
        { kind: "checkbox", label: "Enable Mouse Interaction", key: "threadsEnableMouseInteraction", defaultValue: true },
    ],
    defaults: {
        type: "threads",
        threadsAmplitude: 1,
        threadsColor: "#5226FF",
        threadsDistance: 0,
        threadsEnableMouseInteraction: true,
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <Threads
                amplitude={background.threadsAmplitude ?? 1}
                color={background.threadsColor ?? "#5226FF"}
                distance={background.threadsDistance ?? 0}
                enableMouseInteraction={background.threadsEnableMouseInteraction ?? true}
            />
        </div>
    ),
    supportsOverlay: true,
});