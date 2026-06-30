import { registerBackground } from "../../editor/BackgroundRegistry";
import ShapeGrid from "@/components/ShapeGrid";

registerBackground({
    type: "shapeGrid",
    label: "ShapeGrid",
    fields: [
        { kind: "color", label: "Border Color", key: "shapeGridBorderColor", defaultValue: "#999" },
        { kind: "dropdown", label: "Direction", key: "shapeGridDirection", defaultValue: "diagonal", options: [{ id: "diagonal", code: "Diagonal" }, { id: "horizontal", code: "Horizontal" }, { id: "vertical", code: "Vertical" }] },
        { kind: "color", label: "Hover Fill Color", key: "shapeGridHoverFillColor", defaultValue: "#222" },
        { kind: "slider", label: "Hover Trail Amount", key: "shapeGridHoverTrailAmount", defaultValue: 0, min: 0, max: 10, step: 1 },
        { kind: "dropdown", label: "Shape", key: "shapeGridShape", defaultValue: "square", options: [{ id: "square", code: "Square" }, { id: "circle", code: "Circle" }, { id: "triangle", code: "Triangle" }, { id: "hexagon", code: "Hexagon" }] },
        { kind: "slider", label: "Speed", key: "shapeGridSpeed", defaultValue: 0.5, min: 0, max: 10, step: 0.1 },
        { kind: "slider", label: "Shape Size", key: "shapeGridSquareSize", defaultValue: 40, min: 10, max: 100, step: 1 },
    ],
    defaults: {
        type: "shapeGrid",
        shapeGridBorderColor: "#999",
        shapeGridDirection: "diagonal",
        shapeGridHoverFillColor: "#222",
        shapeGridHoverTrailAmount: 0,
        shapeGridShape: "square",
        shapeGridSpeed: 0.5,
        shapeGridSquareSize: 40,
        overlayColor: "#0a0a0a",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => (
        <div style={ { position: "absolute", inset: 0, width: "100%", height: "100%" } }>
            <ShapeGrid
                borderColor={background.shapeGridBorderColor || "#999"}
                direction={background.shapeGridDirection || "diagonal"}
                hoverFillColor={background.shapeGridHoverFillColor || "#222"}
                hoverTrailAmount={background.shapeGridHoverTrailAmount ?? 0}
                shape={background.shapeGridShape || "square"}
                speed={background.shapeGridSpeed ?? 0.5}
                squareSize={background.shapeGridSquareSize ?? 40}
            />
        </div>
    ),
    supportsOverlay: true,
});
