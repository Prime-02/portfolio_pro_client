// portfolio-builder/components/shared/background/backgrounds/none/index.ts

import { registerBackground } from "../../editor/BackgroundRegistry";


registerBackground({
  type: "none",
  label: "None (transparent)",
  fields: [],
  defaults: { type: "none" },
  supportsOverlay: false,
});
