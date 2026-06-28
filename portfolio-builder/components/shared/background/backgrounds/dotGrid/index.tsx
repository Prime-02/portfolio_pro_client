import { registerBackground } from "../../editor/BackgroundRegistry";
import DotGrid from "@/components/DotGrid";

registerBackground({
    type: "dotGrid",
    label: "Dot Grid",
    fields: [
        { kind: "slider", label: "Dot Size", key: "dotGridDotSize", defaultValue: 16, min: 4, max: 40, step: 1 },
        { kind: "slider", label: "Gap", key: "dotGridGap", defaultValue: 32, min: 8, max: 80, step: 2 },
        { kind: "color", label: "Base Color", key: "dotGridBaseColor", defaultValue: "#5227FF" },
        { kind: "color", label: "Active Color", key: "dotGridActiveColor", defaultValue: "#5227FF" },
        { kind: "slider", label: "Proximity", key: "dotGridProximity", defaultValue: 150, min: 50, max: 400, step: 10 },
        { kind: "slider", label: "Speed Trigger", key: "dotGridSpeedTrigger", defaultValue: 100, min: 10, max: 400, step: 10 },
        { kind: "slider", label: "Shock Radius", key: "dotGridShockRadius", defaultValue: 250, min: 50, max: 600, step: 10 },
        { kind: "slider", label: "Shock Strength", key: "dotGridShockStrength", defaultValue: 5, min: 0, max: 20, step: 0.5 },
        { kind: "slider", label: "Max Speed", key: "dotGridMaxSpeed", defaultValue: 5000, min: 1000, max: 10000, step: 500 },
        { kind: "slider", label: "Resistance", key: "dotGridResistance", defaultValue: 750, min: 250, max: 1500, step: 50 },
        { kind: "slider", label: "Return Duration", key: "dotGridReturnDuration", defaultValue: 1.5, min: 0.1, max: 5, step: 0.1 },
    ],
    defaults: {
        type: "dotGrid",
        dotGridDotSize: 16,
        dotGridGap: 32,
        dotGridBaseColor: "#5227FF",
        dotGridActiveColor: "#5227FF",
        dotGridProximity: 150,
        dotGridSpeedTrigger: 100,
        dotGridShockRadius: 250,
        dotGridShockStrength: 5,
        dotGridMaxSpeed: 5000,
        dotGridResistance: 750,
        dotGridReturnDuration: 1.5,
        overlayColor: "#0a0a0a",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <DotGrid
            dotSize={background.dotGridDotSize ?? 16}
            gap={background.dotGridGap ?? 32}
            baseColor={background.dotGridBaseColor || "#5227FF"}
            activeColor={background.dotGridActiveColor || "#5227FF"}
            proximity={background.dotGridProximity ?? 150}
            speedTrigger={background.dotGridSpeedTrigger ?? 100}
            shockRadius={background.dotGridShockRadius ?? 250}
            shockStrength={background.dotGridShockStrength ?? 5}
            maxSpeed={background.dotGridMaxSpeed ?? 5000}
            resistance={background.dotGridResistance ?? 750}
            returnDuration={background.dotGridReturnDuration ?? 1.5}
            style={{}}
        />
    ),
    supportsOverlay: false,
});