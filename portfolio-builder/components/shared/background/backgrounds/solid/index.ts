// portfolio-builder/components/shared/background/backgrounds/solid/index.ts

import { registerBackground } from "../../editor/BackgroundRegistry";


registerBackground({
  type: "solid",
  label: "Solid Color",
  fields: [
    { kind: "color", label: "Background Color", key: "color", defaultValue: "#0a0a0a" },
  ],
  defaults: {
    type: "solid",
    color: "#0a0a0a",
  },
  getStyle: (bg) => ({
    backgroundColor: bg.color || "#0a0a0a",
  }),
  supportsOverlay: false,
});
