// portfolio-builder/components/shared/background/backgrounds/mesh/index.ts

import { MeshBackground } from "@/portfolio-builder/components/sections/hero/renderer-components/MeshBackground";
import { registerBackground } from "../../editor/BackgroundRegistry";

registerBackground({
  type: "mesh",
  label: "Mesh Gradient",
  fields: [
    {
      kind: "group",
      label: "Colors",
      fields: [
        { kind: "color", label: "Color 1", key: "meshColor1", defaultValue: "#7c3aed" },
        { kind: "color", label: "Color 2", key: "meshColor2", defaultValue: "#2563eb" },
        { kind: "color", label: "Color 3", key: "meshColor3", defaultValue: "#0891b2" },
        { kind: "color", label: "Color 4", key: "meshColor4", defaultValue: "#0a0a0a" },
      ],
    },
    { kind: "color", label: "Base Color", key: "meshBase", defaultValue: "#050510" },
    { kind: "slider", label: "Speed", key: "meshSpeed", defaultValue: 6, min: 1, max: 20, step: 0.5 },
    { kind: "slider", label: "Blur", key: "meshBlur", defaultValue: 80, min: 10, max: 200, step: 5, unit: "px" },
    { kind: "slider", label: "Size", key: "meshSize", defaultValue: 60, min: 10, max: 150, step: 5, unit: "vmin" },
    { kind: "slider", label: "Opacity", key: "meshOpacity", defaultValue: 1, min: 0, max: 1, step: 0.05 },
  ],
  defaults: {
    type: "mesh",
    meshColor1: "#7c3aed",
    meshColor2: "#2563eb",
    meshColor3: "#0891b2",
    meshColor4: "#0a0a0a",
    meshBase: "#050510",
    meshSpeed: 6,
    meshBlur: 80,
    meshSize: 60,
    meshOpacity: 1,
    overlayColor: "#0a0a0a",
    overlayOpacity: 0,
  },
  renderer: ({ background }) => (
    <MeshBackground
      color1={background.meshColor1 || "#7c3aed"}
      color2={background.meshColor2 || "#2563eb"}
      color3={background.meshColor3 || "#0891b2"}
      color4={background.meshColor4 || "var(--pb-background)"}
      speed={background.meshSpeed ?? 6}
      blur={background.meshBlur ?? 80}
      size={background.meshSize ?? 60}
      base={background.meshBase || "#050510"}
      opacity={background.meshOpacity ?? 1}
    />
  ),
  supportsOverlay: true,
});
