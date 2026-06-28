// portfolio-builder/components/PBTextInput.tsx
import React from "react";
import { Textinput, TextInputProps } from "@/src/app/components/inputs/Textinput";
import Dropdown, { DropdownOption } from "@/src/app/components/inputs/DynamicDropdown";

export const PBTextInput: React.FC<TextInputProps> = (props) => {
    return (
        <Textinput
            {...props}
            className={`
        text-[var(--pb-text-primary)]
        bg-[var(--pb-input-bg)]
        border-[var(--pb-input-border)]
        focus:ring-[var(--pb-accent)]
        focus:border-[var(--pb-input-border-focus)]
        placeholder:text-[var(--pb-input-placeholder)]
        ${props.className || ""}
      `}
            labelStyle={`
        text-[var(--pb-text-primary)]
        bg-[var(--pb-input-bg)]
        ${props.labelStyle || ""}
      `}
        />
    );
};



interface PBDropdownProps {
    id?: string;
    options?: DropdownOption[];
    onSelect?: (value: string | string[]) => void;
    tag?: string;
    placeholder?: string;
    valueKey?: string;
    displayKey?: string;
    className?: string;
    containerClassName?: string;
    emptyMessage?: string;
    onFocus?: () => void;
    type?: string;
    value?: string | string[] | number | number[];
    label?: string;
    disabled?: boolean;
    includeNoneOption?: boolean;
    includeQueryAsOption?: boolean;
    error?: string;
    required?: boolean;
    loading?: boolean;
    clearable?: boolean;
    size?: "sm" | "md" | "lg";
    variant?: "outlined" | "filled";
    multiple?: boolean;
    maxSelections?: number;
    selectAll?: boolean;
}

export const PBDropdown: React.FC<PBDropdownProps> = (props) => {
    return (
        <div
            style={{
                // Remap standard theme variables to portfolio theme variables
                "--foreground": "var(--pb-foreground)",
                "--background": "var(--pb-background)",
                "--accent": "var(--pb-accent)",
            } as React.CSSProperties}
        >
            <Dropdown
                {...props}
                className={`
          bg-[var(--pb-input-bg)]
          border-[var(--pb-input-border)]
          hover:border-[var(--pb-border-hover)]
          ${props.className || ""}
        `}
            />
        </div>
    );
};

