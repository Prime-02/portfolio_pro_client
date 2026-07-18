import { registerBackground } from "../../editor/BackgroundRegistry";
import Plasma from "@/components/Plasma";

registerBackground({
    type: "plasma",
    label: "Plasma",
    fields: [
        { kind: "color", label: "Color", key: "plasmaColor", defaultValue: "#ffffff" },
        { kind: "dropdown", label: "Direction", key: "plasmaDirection", defaultValue: "forward", options: [{ id: "forward", code: "Forward" }, { id: "backward", code: "Backward" }] },
        { kind: "checkbox", label: "Mouse Interactive", key: "plasmaMouseInteractive", defaultValue: true },
        { kind: "slider", label: "Opacity", key: "plasmaOpacity", defaultValue: 1, min: 0, max: 1, step: 0.1 },
        { kind: "slider", label: "Scale", key: "plasmaScale", defaultValue: 1, min: 0, max: 3, step: 1 },
        { kind: "slider", label: "Speed", key: "plasmaSpeed", defaultValue: 1, min: 0, max: 5, step: 1 },
    ],
    defaults: {
        type: "plasma",
        plasmaColor: "#ffffff",
        plasmaDirection: "forward",
        plasmaMouseInteractive: true,
        plasmaOpacity: 1,
        plasmaScale: 1,
        plasmaSpeed: 1,
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <Plasma
                color={background.plasmaColor || "#ffffff"}
                direction={background.plasmaDirection || "forward"}
                mouseInteractive={background.plasmaMouseInteractive ?? true}
                opacity={background.plasmaOpacity ?? 1}
                scale={background.plasmaScale ?? 1}
                speed={background.plasmaSpeed ?? 1}
            />
        </div>
    ),
    supportsOverlay: true,
});
