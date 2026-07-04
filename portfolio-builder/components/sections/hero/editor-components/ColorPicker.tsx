// portfolio-builder/components/sections/hero/editor-components/ColorPicker.tsx

import AppColorPicker from "@/src/app/components/inputs/ColorPicker";

interface ColorPickerProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function ColorPicker({ id, value, onChange, placeholder }: ColorPickerProps) {
    return (
        <div className="flex gap-2">
            <AppColorPicker 
            value={value}
            onChange={onChange}
            />
        </div>
    );
}