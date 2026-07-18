import { registerBackground } from "../../editor/BackgroundRegistry";
import Ballpit from "@/components/Ballpit";

registerBackground({
    type: "ballpit",
    label: "Ballpit",
    fields: [
        { kind: "slider", label: "Count", key: "ballpitCount", defaultValue: 100, min: 10, max: 300, step: 10 },
        { kind: "slider", label: "Gravity", key: "ballpitGravity", defaultValue: 0.5, min: 0, max: 2, step: 0.05 },
        { kind: "slider", label: "Friction", key: "ballpitFriction", defaultValue: 0.9975, min: 0.9, max: 1, step: 0.0005 },
        { kind: "slider", label: "Wall Bounce", key: "ballpitWallBounce", defaultValue: 0.95, min: 0.5, max: 1, step: 0.01 },
        { kind: "checkbox", label: "Follow Cursor", key: "ballpitFollowCursor", defaultValue: true },
        {
            kind: "group",
            label: "Colors",
            fields: [
                { kind: "color", label: "Color 1", key: "ballpitColor1", defaultValue: "#5227FF" },
                { kind: "color", label: "Color 2", key: "ballpitColor2", defaultValue: "#7cff67" },
                { kind: "color", label: "Color 3", key: "ballpitColor3", defaultValue: "#ff6b6b" },
            ],
        },
    ],
    defaults: {
        type: "ballpit",
        ballpitCount: 100,
        ballpitGravity: 0.5,
        ballpitFriction: 0.9975,
        ballpitWallBounce: 0.95,
        ballpitFollowCursor: true,
        ballpitColor1: "#5227FF",
        ballpitColor2: "#7cff67",
        ballpitColor3: "#ff6b6b",
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <Ballpit
            count={background.ballpitCount ?? 100}
            gravity={background.ballpitGravity ?? 0.5}
            friction={background.ballpitFriction ?? 0.9975}
            wallBounce={background.ballpitWallBounce ?? 0.95}
            followCursor={background.ballpitFollowCursor ?? true}
            colors={[
                background.ballpitColor1 || "#5227FF",
                background.ballpitColor2 || "#7cff67",
                background.ballpitColor3 || "#ff6b6b",
            ]}
        />
    ),
    supportsOverlay: true,
});
