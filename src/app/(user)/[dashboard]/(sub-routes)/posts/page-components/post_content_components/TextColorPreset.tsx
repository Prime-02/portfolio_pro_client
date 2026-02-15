import { Palette } from "lucide-react";
import React, { useState, useEffect } from "react";

const TextColorPreset = ({
  color,
  setColor,
}: {
  color: string;
  setColor: (color: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const colorPresets = [
    { name: "Midnight", value: "#1a1a2e" },
    { name: "Ocean", value: "#0077b6" },
    { name: "Forest", value: "#2d6a4f" },
    { name: "Sunset", value: "#f77f00" },
    { name: "Rose", value: "#e63946" },
    { name: "Lavender", value: "#7209b7" },
    { name: "Gold", value: "#ffd60a" },
    { name: "Coral", value: "#ff6b9d" },
    { name: "Teal", value: "#06d6a0" },
    { name: "Slate", value: "#6c757d" },
  ];
  

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * colorPresets.length);
    setColor(colorPresets[randomIndex].value);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-[var(--foreground)] border-[var(--accent)] transition-colors"
        aria-label="Color presets"
      >
        <Palette className="w-5 h-5" style={{ color }} />
      </button>

      <div
        className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        style={{ minWidth: "48px" }}
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col items-center space-y-2">
          {colorPresets.map((preset, index) => {
            // stagger top-to-bottom animation
            const delayOpen = `${index * 40}ms`;
            const delayClose = `${(colorPresets.length - 1 - index) * 20}ms`;
            const transitionDelay = isOpen ? delayOpen : delayClose;

            return (
              <button
                key={preset.value}
                onClick={() => {
                  setColor(preset.value);
                  setIsOpen(false);
                }}
                className="w-8 h-8 rounded-full transition-transform transition-opacity"
                style={{
                  backgroundColor: preset.value,
                  transform: isOpen ? "translateY(0)" : "translateY(-8px)",
                  opacity: isOpen ? 1 : 0,
                  transition: `transform 260ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease`,
                  transitionDelay,
                  pointerEvents: isOpen ? "auto" : "none",
                }}
                title={preset.name}
                aria-label={`${preset.name} color`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TextColorPreset;
