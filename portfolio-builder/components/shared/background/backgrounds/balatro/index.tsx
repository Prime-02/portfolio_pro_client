import { registerBackground } from "../../editor/BackgroundRegistry";
import Balatro from "@/components/Balatro";

registerBackground({
    type: "balatro",
    label: "Balatro",
    fields: [
        {
            kind: "group",
            label: "Colors",
            fields: [
                { kind: "color", label: "Color 1", key: "balatroColor1", defaultValue: "#DE443B" },
                { kind: "color", label: "Color 2", key: "balatroColor2", defaultValue: "#006BB4" },
                { kind: "color", label: "Color 3", key: "balatroColor3", defaultValue: "#162325" },
            ],
        },
        { kind: "slider", label: "Spin Rotation", key: "balatroSpinRotation", defaultValue: -2, min: -10, max: 10, step: 0.5 },
        { kind: "slider", label: "Spin Speed", key: "balatroSpinSpeed", defaultValue: 7, min: 0, max: 20, step: 0.5 },
        { kind: "slider", label: "Contrast", key: "balatroContrast", defaultValue: 3.5, min: 0, max: 10, step: 0.1 },
        { kind: "slider", label: "Lighting", key: "balatroLighting", defaultValue: 0.4, min: 0, max: 1, step: 0.05 },
        { kind: "slider", label: "Spin Amount", key: "balatroSpinAmount", defaultValue: 0.25, min: 0, max: 1, step: 0.05 },
        { kind: "slider", label: "Pixel Filter", key: "balatroPixelFilter", defaultValue: 700, min: 100, max: 2000, step: 50 },
        { kind: "checkbox", label: "Rotate", key: "balatroIsRotate", defaultValue: false },
        { kind: "checkbox", label: "Mouse Interaction", key: "balatroMouseInteraction", defaultValue: true },
    ],
    defaults: {
        type: "balatro",
        balatroColor1: "#DE443B",
        balatroColor2: "#006BB4",
        balatroColor3: "#162325",
        balatroSpinRotation: -2,
        balatroSpinSpeed: 7,
        balatroContrast: 3.5,
        balatroLighting: 0.4,
        balatroSpinAmount: 0.25,
        balatroPixelFilter: 700,
        balatroIsRotate: false,
        balatroMouseInteraction: true,
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <Balatro
                spinRotation={background.balatroSpinRotation ?? -2}
                spinSpeed={background.balatroSpinSpeed ?? 7}
                color1={background.balatroColor1 || "#DE443B"}
                color2={background.balatroColor2 || "#006BB4"}
                color3={background.balatroColor3 || "#162325"}
                contrast={background.balatroContrast ?? 3.5}
                lighting={background.balatroLighting ?? 0.4}
                spinAmount={background.balatroSpinAmount ?? 0.25}
                pixelFilter={background.balatroPixelFilter ?? 700}
                isRotate={background.balatroIsRotate ?? false}
                mouseInteraction={background.balatroMouseInteraction ?? true}
            />
        </div>
    ),
    supportsOverlay: false,
});
