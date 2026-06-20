"use client";

import { Textinput } from "../../inputs/Textinput";

interface TagInputProps {
    label: string;
    placeholder: string;
    items: string[];
    inputValue: string;
    onInputChange: (value: string) => void;
    onAdd: (value: string) => void;
    onRemove: (value: string) => void;
    chipVariant?: "accent" | "muted";
    chipIcon?: React.ReactNode;
}

export function TagInput({
    label,
    placeholder,
    items,
    inputValue,
    onInputChange,
    onAdd,
    onRemove,
    chipVariant = "muted",
    chipIcon,
}: TagInputProps) {
    const accentChip =
        "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 rounded-lg";
    const mutedChip =
        "bg-[var(--foreground)]/5 text-[var(--foreground)]/50 border border-[var(--foreground)]/10 rounded-full";

    return (
        <div>
            <div className="flex gap-2 flex-col mb-2">
                <Textinput
                    label={label}
                    type="text"
                    value={inputValue}
                    onChange={(e) => onInputChange(e)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && inputValue.trim()) {
                            onAdd(inputValue.trim());
                        }
                    }}
                    desc={placeholder}
                    className="w-full"
                />
            </div>
            <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                    <span
                        key={item}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs ${chipVariant === "accent" ? accentChip : mutedChip
                            }`}
                    >
                        {chipIcon}
                        {item}
                        <button onClick={() => onRemove(item)} className="hover:text-red-500">
                            ×
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
}