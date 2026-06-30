import { registerBackground } from "../../editor/BackgroundRegistry";
import FloatingLines from "@/components/FloatingLines";

registerBackground({
    type: "floatingLines",
    label: "FloatingLines",
    fields: [
        { kind: "slider", label: "Animation Speed", key: "floatingLinesAnimationSpeed", defaultValue: 1, min: 0, max: 10, step: 1 },
        { kind: "slider", label: "Bend Radius", key: "floatingLinesBendRadius", defaultValue: 5, min: 0, max: 100, step: 1 },
        { kind: "slider", label: "Bend Strength", key: "floatingLinesBendStrength", defaultValue: -0.5, min: -1.0, max: 10, step: 0.1 },
        { kind: "checkbox", label: "Interactive", key: "floatingLinesInteractive", defaultValue: true },
        {
            kind: "group", label: "Lines Gradient", fields: [
                { kind: "color", label: "Color 1", key: "floatingLinesLinesGradient1", defaultValue: "#E945F5" },
                { kind: "color", label: "Color 2", key: "floatingLinesLinesGradient2", defaultValue: "#2F4BC0" },
                { kind: "color", label: "Color 3", key: "floatingLinesLinesGradient3", defaultValue: "#E945F5" }
            ]
        },
        { kind: "slider", label: "Mouse Damping", key: "floatingLinesMouseDamping", defaultValue: 0.05, min: 0, max: 2, step: 0.01 },
        { kind: "checkbox", label: "Parallax", key: "floatingLinesParallax", defaultValue: true },
        { kind: "slider", label: "Parallax Strength", key: "floatingLinesParallaxStrength", defaultValue: 0.2, min: 0, max: 10, step: 0.1 },
        { kind: "slider", label: "Top Wave Position", key: "floatingLinesTopWavePosition", defaultValue: 50, min: 0, max: 100, step: 1 },
        { kind: "slider", label: "Middle Wave Position", key: "floatingLinesMiddleWavePosition", defaultValue: 50, min: 0, max: 100, step: 1 },
    ],
    defaults: {
        type: "floatingLines",
        floatingLinesAnimationSpeed: 1,
        floatingLinesBendRadius: 5,
        floatingLinesBendStrength: -0.5,
        floatingLinesInteractive: true,
        floatingLinesLinesGradient1: "#E945F5",
        floatingLinesLinesGradient2: "#2F4BC0",
        floatingLinesLinesGradient3: "#E945F5",
        floatingLinesMouseDamping: 0.05,
        floatingLinesParallax: true,
        floatingLinesParallaxStrength: 0.2,
        floatingLinesTopWavePosition: 50,
        floatingLinesMiddleWavePosition: 50,
        overlayColor: "#0a0a0a",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <FloatingLines
                animationSpeed={background.floatingLinesAnimationSpeed ?? 1}
                bendRadius={background.floatingLinesBendRadius ?? 5}
                bendStrength={background.floatingLinesBendStrength ?? -0.5}
                interactive={background.floatingLinesInteractive ?? true}
                linesGradient={[
                    background.floatingLinesLinesGradient1 || '#E945F5',
                    background.floatingLinesLinesGradient2 || '#2F4BC0',
                    background.floatingLinesLinesGradient3 || '#E945F5'
                ]}
                mouseDamping={background.floatingLinesMouseDamping ?? 0.05}
                parallax={background.floatingLinesParallax ?? true}
                parallaxStrength={background.floatingLinesParallaxStrength ?? 0.2}
                topWavePosition={background.floatingLinesTopWavePosition ?? 50}
                middleWavePosition={background.floatingLinesMiddleWavePosition ?? 50}
            />
        </div>
    ),
    supportsOverlay: true,
});