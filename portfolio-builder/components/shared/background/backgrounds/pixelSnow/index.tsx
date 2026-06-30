import { registerBackground } from "../../editor/BackgroundRegistry";
import PixelSnow from "@/components/PixelSnow";

registerBackground({
    type: "pixelSnow",
    label: "PixelSnow",
    fields: [
        { kind: "slider", label: "Brightness", key: "pixelSnowBrightness", defaultValue: 1, min: 0, max: 3, step: 1 },
        { kind: "color", label: "Color", key: "pixelSnowColor", defaultValue: "#ffffff" },
        { kind: "slider", label: "Density", key: "pixelSnowDensity", defaultValue: 0.3, min: 0, max: 1, step: 0.1 },
        { kind: "slider", label: "Depth Fade", key: "pixelSnowDepthFade", defaultValue: 8, min: 0, max: 20, step: 1 },
        { kind: "slider", label: "Direction", key: "pixelSnowDirection", defaultValue: 125, min: 0, max: 360, step: 1 },
        { kind: "slider", label: "Far Plane", key: "pixelSnowFarPlane", defaultValue: 20, min: 0, max: 50, step: 1 },
        { kind: "slider", label: "Flake Size", key: "pixelSnowFlakeSize", defaultValue: 0.01, min: 0, max: 0.05, step: 0.01 },
        { kind: "slider", label: "Gamma", key: "pixelSnowGamma", defaultValue: 0.4545, min: 0, max: 1, step: 0.1 },
        { kind: "slider", label: "Min Flake Size", key: "pixelSnowMinFlakeSize", defaultValue: 1.25, min: 0, max: 3, step: 0.25 },
        { kind: "slider", label: "Pixel Resolution", key: "pixelSnowPixelResolution", defaultValue: 200, min: 50, max: 500, step: 25 },
        { kind: "slider", label: "Speed", key: "pixelSnowSpeed", defaultValue: 1.25, min: 0, max: 5, step: 0.1 },
        { kind: "dropdown", label: "Variant", key: "pixelSnowVariant", defaultValue: "square", options: [{ id: "square", code: "Square" }, { id: "round", code: "Round" }, { id: "snowflake", code: "Snow Flake" }] },
    ],
    defaults: {
        type: "pixelSnow",
        pixelSnowBrightness: 1,
        pixelSnowColor: "#ffffff",
        pixelSnowDensity: 0.3,
        pixelSnowDepthFade: 8,
        pixelSnowDirection: 125,
        pixelSnowFarPlane: 20,
        pixelSnowFlakeSize: 0.01,
        pixelSnowGamma: 0.4545,
        pixelSnowMinFlakeSize: 1.25,
        pixelSnowPixelResolution: 200,
        pixelSnowSpeed: 1.25,
        pixelSnowVariant: "square",
        overlayColor: "#0a0a0a",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <PixelSnow
                brightness={background.pixelSnowBrightness ?? 1}
                color={background.pixelSnowColor || "#ffffff"}
                density={background.pixelSnowDensity ?? 0.3}
                depthFade={background.pixelSnowDepthFade ?? 8}
                direction={background.pixelSnowDirection ?? 125}
                farPlane={background.pixelSnowFarPlane ?? 20}
                flakeSize={background.pixelSnowFlakeSize ?? 0.01}
                gamma={background.pixelSnowGamma ?? 0.4545}
                minFlakeSize={background.pixelSnowMinFlakeSize ?? 1.25}
                pixelResolution={background.pixelSnowPixelResolution ?? 200}
                speed={background.pixelSnowSpeed ?? 1.25}
                variant={background.pixelSnowVariant || "square"}
            />
        </div>
    ),
    supportsOverlay: true,
});