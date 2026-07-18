import { registerBackground } from "../../editor/BackgroundRegistry";
import PixelBlast from "@/components/PixelBlast";

registerBackground({
    type: "pixelBlast",
    label: "PixelBlast",
    fields: [
        { kind: "color", label: "Color", key: "pixelBlastColor", defaultValue: "#B497CF" },
        { kind: "slider", label: "Edge Fade", key: "pixelBlastEdgeFade", defaultValue: 0.5, min: 0, max: 2, step: 0.01 },
        { kind: "checkbox", label: "Enable Ripples", key: "pixelBlastEnableRipples", defaultValue: false },
        { kind: "slider", label: "Pattern Density", key: "pixelBlastPatternDensity", defaultValue: 1, min: 0, max: 2, step: 1 },
        { kind: "slider", label: "Pattern Scale", key: "pixelBlastPatternScale", defaultValue: 2, min: 0, max: 5, step: 1 },
        { kind: "slider", label: "Pixel Size", key: "pixelBlastPixelSize", defaultValue: 3, min: 0, max: 100, step: 1 },
        { kind: "slider", label: "Ripple Intensity Scale", key: "pixelBlastRippleIntensityScale", defaultValue: 1, min: 0, max: 10, step: 1 },
        { kind: "slider", label: "Ripple Speed", key: "pixelBlastRippleSpeed", defaultValue: 0.3, min: 0, max: 10, step: 0.1 },
        { kind: "slider", label: "Ripple Thickness", key: "pixelBlastRippleThickness", defaultValue: 0.1, min: 0, max: 50, step: 1 },
        { kind: "slider", label: "Speed", key: "pixelBlastSpeed", defaultValue: 0.5, min: 0, max: 10, step: 0.1 },
        { kind: "checkbox", label: "Transparent", key: "pixelBlastTransparent", defaultValue: false },
        { kind: "dropdown", label: "Variant", key: "pixelBlastVariant", defaultValue: "square", options: [{ id: "square", code: "Square" }, { id: "circle", code: "Circle" }, { id: "triangle", code: "Triangle" }, { id: "diamond", code: "Diamond" }] },
    ],
    defaults: {
        type: "pixelBlast",
        pixelBlastColor: "#B497CF",
        pixelBlastEdgeFade: 0.5,
        pixelBlastEnableRipples: false,
        pixelBlastPatternDensity: 1,
        pixelBlastPatternScale: 2,
        pixelBlastPixelSize: 3,
        pixelBlastRippleIntensityScale: 1,
        pixelBlastRippleSpeed: 0.3,
        pixelBlastRippleThickness: 0.1,
        pixelBlastSpeed: 0.5,
        pixelBlastTransparent: false,
        pixelBlastVariant: "square",
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <PixelBlast
                className=""
                style={{}}
                color={background.pixelBlastColor || "#B497CF"}
                edgeFade={background.pixelBlastEdgeFade ?? 0.5}
                enableRipples={background.pixelBlastEnableRipples ?? false}
                patternDensity={background.pixelBlastPatternDensity ?? 1}
                patternScale={background.pixelBlastPatternScale ?? 2}
                pixelSize={background.pixelBlastPixelSize ?? 3}
                rippleIntensityScale={background.pixelBlastRippleIntensityScale ?? 1}
                rippleSpeed={background.pixelBlastRippleSpeed ?? 0.3}
                rippleThickness={background.pixelBlastRippleThickness ?? 0.1}
                speed={background.pixelBlastSpeed ?? 0.5}
                transparent={background.pixelBlastTransparent ?? false}
                variant={background.pixelBlastVariant || "square"}
            />
        </div>
    ),
    supportsOverlay: true,
});