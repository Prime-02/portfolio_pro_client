import { registerBackground } from "../../editor/BackgroundRegistry";
import LiquidEther from "@/components/LiquidEther";

registerBackground({
    type: "liquidEther",
    label: "LiquidEther",
    fields: [
        { kind: "checkbox", label: "Auto Demo", key: "liquidEtherAutoDemo", defaultValue: true },
        { kind: "slider", label: "Auto Intensity", key: "liquidEtherAutoIntensity", defaultValue: 2.2, min: 0, max: 5, step: 0.1 },
        { kind: "slider", label: "Auto Speed", key: "liquidEtherAutoSpeed", defaultValue: 0.5, min: 0, max: 2, step: 0.1 },
        {
            kind: "group", label: "Colors", fields: [
                { kind: "color", label: "Color 1", key: "liquidEtherColors1", defaultValue: "#5227FF" },
                { kind: "color", label: "Color 2", key: "liquidEtherColors2", defaultValue: "#FF9FFC" },
                { kind: "color", label: "Color 3", key: "liquidEtherColors3", defaultValue: "#B497CF" }
            ]
        },
        { kind: "slider", label: "Cursor Size", key: "liquidEtherCursorSize", defaultValue: 100, min: 0, max: 300, step: 1 },
        { kind: "checkbox", label: "Is Bounce", key: "liquidEtherIsBounce", defaultValue: false },
        { kind: "checkbox", label: "Is Viscous", key: "liquidEtherIsViscous", defaultValue: false },
        { kind: "slider", label: "Mouse Force", key: "liquidEtherMouseForce", defaultValue: 20, min: 0, max: 50, step: 1 },
        { kind: "slider", label: "Resolution", key: "liquidEtherResolution", defaultValue: 0.5, min: 0.1, max: 1, step: 0.1 },
        { kind: "slider", label: "Viscous", key: "liquidEtherViscous", defaultValue: 30, min: 0, max: 100, step: 1 },
    ],
    defaults: {
        type: "liquidEther",
        liquidEtherAutoDemo: true,
        liquidEtherAutoIntensity: 2.2,
        liquidEtherAutoSpeed: 0.5,
        liquidEtherColors1: "#5227FF",
        liquidEtherColors2: "#FF9FFC",
        liquidEtherColors3: "#B497CF",
        liquidEtherCursorSize: 100,
        liquidEtherIsBounce: false,
        liquidEtherIsViscous: false,
        liquidEtherMouseForce: 20,
        liquidEtherResolution: 0.5,
        liquidEtherViscous: 30,
        overlayColor: "#0a0a0a",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <LiquidEther
                autoDemo={background.liquidEtherAutoDemo ?? true}
                autoIntensity={background.liquidEtherAutoIntensity ?? 2.2}
                autoSpeed={background.liquidEtherAutoSpeed ?? 0.5}
                colors={[background.liquidEtherColors1 || '#5227FF', background.liquidEtherColors2 || '#FF9FFC', background.liquidEtherColors3 || '#B497CF']}
                cursorSize={background.liquidEtherCursorSize ?? 100}
                isBounce={background.liquidEtherIsBounce ?? false}
                isViscous={background.liquidEtherIsViscous ?? false}
                mouseForce={background.liquidEtherMouseForce ?? 20}
                resolution={background.liquidEtherResolution ?? 0.5}
                viscous={background.liquidEtherViscous ?? 30}
            />
        </div>
    ),
    supportsOverlay: true,
});