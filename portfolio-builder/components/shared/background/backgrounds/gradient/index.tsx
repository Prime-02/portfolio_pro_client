// portfolio-builder/components/shared/background/backgrounds/gradient/index.ts

import { registerBackground } from "../../editor/BackgroundRegistry";
import { getBackgroundStyle } from "../../lib/sectionBackground";

registerBackground({
  type: "gradient",
  label: "Gradient",
  fields: [
    {
      kind: "custom",
      label: "Preview",
      render: (bg, onUpdate) => (
        <div
          className="w-full h-10 rounded-lg border border-[var(--pb-border)]"
          style={getBackgroundStyle(bg)}
        />
      ),
    },
    {
      kind: "custom",
      label: "Gradient Type",
      render: (bg, onUpdate) => {
        const type = bg.gradientType || "linear";
        return (
          <div className="flex gap-2">
            {(["linear", "radial"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onUpdate({ gradientType: t })}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs border capitalize ${
                  type === t
                    ? "border-[#ffffff] bg-[var(--pb-foreground-10)]"
                    : "border-[var(--pb-border)] text-[var(--pb-text-muted)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        );
      },
    },
    { kind: "color", label: "From", key: "gradientFrom", defaultValue: "#1a1a2e" },
    { kind: "color", label: "To", key: "gradientTo", defaultValue: "#0a0a0a" },
    {
      kind: "slider",
      label: "Angle",
      key: "gradientAngle",
      defaultValue: 135,
      min: 0,
      max: 360,
      step: 1,
      unit: "°",
    },
    {
      kind: "text",
      label: "Radial Position",
      key: "radialPosition",
      defaultValue: "center",
      placeholder: "center, top left, 50% 50%",
    },
  ],
  defaults: {
    type: "gradient",
    gradientType: "linear",
    gradientFrom: "#1a1a2e",
    gradientTo: "#0a0a0a",
    gradientAngle: 135,
    radialPosition: "center",
  },
  getStyle: (bg) => {
    const from = bg.gradientFrom || "#1a1a2e";
    const to = bg.gradientTo || "#0a0a0a";
    const angle = typeof bg.gradientAngle === "string" ? parseFloat(bg.gradientAngle) || 135 : (bg.gradientAngle ?? 135);
    const position = bg.radialPosition || "center";
    const gradientCSS =
      bg.gradientType === "radial"
        ? `radial-gradient(circle at ${position}, ${from}, ${to})`
        : `linear-gradient(${angle}deg, ${from}, ${to})`;
    return { background: gradientCSS };
  },
  supportsOverlay: false,
});
