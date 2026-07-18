// portfolio-builder/components/shared/background/backgrounds/image/index.ts

import { registerBackground } from "../../editor/BackgroundRegistry";

registerBackground({
  type: "image",
  label: "Image",
  fields: [
    { kind: "text", label: "Image URL", key: "imageUrl", defaultValue: "" },
    {
      kind: "dropdown",
      label: "Size",
      key: "backgroundSize",
      defaultValue: "cover",
      options: [
        { id: "cover", code: "Cover" },
        { id: "contain", code: "Contain" },
        { id: "auto", code: "Auto" },
      ],
    },
    {
      kind: "text",
      label: "Position",
      key: "backgroundPosition",
      defaultValue: "center",
      placeholder: "center",
    },
    {
      kind: "checkbox",
      label: "Repeat background",
      key: "backgroundRepeat",
      defaultValue: false,
    },
  ],
  defaults: {
    type: "image",
    imageUrl: "",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: false,
    overlayColor: "#000000",
    overlayOpacity: 0,
  },
  getStyle: (bg) =>
    bg.imageUrl
      ? {
          backgroundImage: `url(${bg.imageUrl})`,
          backgroundSize: bg.backgroundSize || "cover",
          backgroundPosition: bg.backgroundPosition || "center",
          backgroundRepeat: bg.backgroundRepeat ? "repeat" : "no-repeat",
        }
      : {},
  supportsOverlay: true,
});
