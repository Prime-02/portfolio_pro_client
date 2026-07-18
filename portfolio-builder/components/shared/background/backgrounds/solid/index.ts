// portfolio-builder/components/shared/background/backgrounds/solid/index.ts

import { registerBackground } from "../../editor/BackgroundRegistry";


registerBackground({
  type: "solid",
  label: "Solid Color",
  fields: [
    { kind: "color", label: "Background Color", key: "color", defaultValue: "#000000" },
  ],
  defaults: {
    type: "solid",
    color: "#000000",
  },
  getStyle: (bg) => ({
    backgroundColor: bg.color || "#000000",
  }),
  supportsOverlay: false,
});
