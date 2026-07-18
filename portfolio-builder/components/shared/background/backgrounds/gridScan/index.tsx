import { registerBackground } from "../../editor/BackgroundRegistry";
import { GridScan } from "@/components/GridScan";

registerBackground({
    type: "gridScan",
    label: "GridScan",
    fields: [
        { kind: "slider", label: "Grid Scale", key: "gridScanGridScale", defaultValue: 0.1, min: 0, max: 5, step: 0.1 },
        { kind: "slider", label: "Line Jitter", key: "gridScanLineJitter", defaultValue: 0.1, min: 0, max: 2, step: 0.01 },
        { kind: "dropdown", label: "Line Style", key: "gridScanLineStyle", defaultValue: "solid", options: [{ id: "solid", code: "Solid" }, { id: "dashed", code: "Dashed" }, { id: "dotted", code: "Dotted" }] },
        { kind: "slider", label: "Line Thickness", key: "gridScanLineThickness", defaultValue: 1, min: 0, max: 50, step: 1 },
        { kind: "color", label: "Lines Color", key: "gridScanLinesColor", defaultValue: "#2F293A" },
        { kind: "slider", label: "Noise Intensity", key: "gridScanNoiseIntensity", defaultValue: 0.01, min: 0, max: 10, step: 0.1 },
        { kind: "color", label: "Scan Color", key: "gridScanScanColor", defaultValue: "#FF9FFC" },
        { kind: "slider", label: "Scan Delay", key: "gridScanScanDelay", defaultValue: 2, min: 0, max: 10, step: 1 },
        { kind: "dropdown", label: "Scan Direction", key: "gridScanScanDirection", defaultValue: "pingpong", options: [{ id: "pingpong", code: "Ping Pong" }, { id: "forward", code: "Forward" }, { id: "backward", code: "Backward" }] },
        { kind: "slider", label: "Scan Duration", key: "gridScanScanDuration", defaultValue: 2, min: 0, max: 10, step: 1 },
        { kind: "slider", label: "Scan Glow", key: "gridScanScanGlow", defaultValue: 0.5, min: 0, max: 5, step: 0.1 },
        { kind: "checkbox", label: "Scan On Click", key: "gridScanScanOnClick", defaultValue: true },
        { kind: "slider", label: "Scan Opacity", key: "gridScanScanOpacity", defaultValue: 0.4, min: 0, max: 1, step: 0.1 },
        { kind: "slider", label: "Scan Softness", key: "gridScanScanSoftness", defaultValue: 2, min: 0, max: 20, step: 1 },
        { kind: "slider", label: "Sensitivity", key: "gridScanSensitivity", defaultValue: 0.55, min: 0, max: 2, step: 0.05 },
    ],
    defaults: {
        type: "gridScan",
        gridScanGridScale: 0.1,
        gridScanLineJitter: 0.1,
        gridScanLineStyle: "solid",
        gridScanLineThickness: 1,
        gridScanLinesColor: "#2F293A",
        gridScanNoiseIntensity: 0.01,
        gridScanScanColor: "#FF9FFC",
        gridScanScanDelay: 2,
        gridScanScanDirection: "pingpong",
        gridScanScanDuration: 2,
        gridScanScanGlow: 0.5,
        gridScanScanOnClick: true,
        gridScanScanOpacity: 0.4,
        gridScanScanSoftness: 2,
        gridScanSensitivity: 0.55,
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <GridScan
                className=""
                style={{}}
                gridScale={background.gridScanGridScale ?? 0.1}
                lineJitter={background.gridScanLineJitter ?? 0.1}
                lineStyle={background.gridScanLineStyle || "solid"}
                lineThickness={background.gridScanLineThickness ?? 1}
                linesColor={background.gridScanLinesColor || "#2F293A"}
                noiseIntensity={background.gridScanNoiseIntensity ?? 0.01}
                scanColor={background.gridScanScanColor || "#FF9FFC"}
                scanDelay={background.gridScanScanDelay ?? 2}
                scanDirection={background.gridScanScanDirection || "pingpong"}
                scanDuration={background.gridScanScanDuration ?? 2}
                scanGlow={background.gridScanScanGlow ?? 0.5}
                scanOnClick={background.gridScanScanOnClick ?? true}
                scanOpacity={background.gridScanScanOpacity ?? 0.4}
                scanSoftness={background.gridScanScanSoftness ?? 2}
                sensitivity={background.gridScanSensitivity ?? 0.55}
            />
        </div>
    ),
    supportsOverlay: true,
});