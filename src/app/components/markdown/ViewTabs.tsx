// ViewTabs.tsx  (unchanged)
"use client";

type ViewMode = "editor" | "split" | "preview";

interface ViewTabsProps {
    currentMode: ViewMode;
    onModeChange: (mode: ViewMode) => void;
}

const modes: { id: ViewMode; label: string }[] = [
    { id: "editor", label: "✏ Write" },
    { id: "split", label: "⊟ Split" },
    { id: "preview", label: "👁 Preview" },
];

export function ViewTabs({ currentMode, onModeChange }: ViewTabsProps) {
    return (
        <div className="mde2-tabs">
            {modes.map(({ id, label }) => (
                <button
                    key={id}
                    type="button"
                    className={`mde2-tab${currentMode === id ? " active" : ""}`}
                    onClick={() => onModeChange(id)}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}