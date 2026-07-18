import { registerBackground } from "../../editor/BackgroundRegistry";
import LetterGlitch from "@/components/LetterGlitch";

registerBackground({
    type: "letterGlitch",
    label: "LetterGlitch",
    fields: [
        { kind: "checkbox", label: "Center Vignette", key: "letterGlitchCenterVignette", defaultValue: true },
        {
            kind: "group", label: "Glitch Colors", fields: [
                { kind: "color", label: "Color 1", key: "letterGlitchGlitchColors1", defaultValue: "#5227FF" },
                { kind: "color", label: "Color 2", key: "letterGlitchGlitchColors2", defaultValue: "#7cff67" },
                { kind: "color", label: "Color 3", key: "letterGlitchGlitchColors3", defaultValue: "#ff6b6b" }
            ]
        },
        { kind: "slider", label: "Glitch Speed", key: "letterGlitchGlitchSpeed", defaultValue: 50, min: 0, max: 10, step: 1 },
        { kind: "checkbox", label: "Outer Vignette", key: "letterGlitchOuterVignette", defaultValue: false },
        { kind: "checkbox", label: "Smooth", key: "letterGlitchSmooth", defaultValue: true },
    ],
    defaults: {
        type: "letterGlitch",
        letterGlitchCenterVignette: true,
        letterGlitchGlitchColors1: "#5227FF",
        letterGlitchGlitchColors2: "#7cff67",
        letterGlitchGlitchColors3: "#ff6b6b",
        letterGlitchGlitchSpeed: 50,
        letterGlitchOuterVignette: false,
        letterGlitchSmooth: true,
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <LetterGlitch
                centerVignette={background.letterGlitchCenterVignette ?? true}
                glitchColors={[background.letterGlitchGlitchColors1 || '#5227FF', background.letterGlitchGlitchColors2 || '#7cff67', background.letterGlitchGlitchColors3 || '#ff6b6b']}
                glitchSpeed={background.letterGlitchGlitchSpeed ?? 50}
                outerVignette={background.letterGlitchOuterVignette ?? false}
                smooth={background.letterGlitchSmooth ?? true}
            />
        </div>
    ),
    supportsOverlay: true,
});
