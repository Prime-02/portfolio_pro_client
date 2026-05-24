// portfolio-builder/components/sections/hero/editor-components/SelectField.tsx

import Field from './Field';
import Dropdown from '@/src/app/components/inputs/DynamicDropdown';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectFieldProps {
    label: string;
    id: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
}

export default function SelectField({ label, id, value, onChange, options }: SelectFieldProps) {
    const modifiedOptions = options.map((opt) => ({
        id: opt.value,
        code: opt.label,
    }));
    return (
        <Field label={label} htmlFor={id}>
            <Dropdown
                options={modifiedOptions}
                value={value}
                onSelect={(val) => onChange(val as string)}
                includeNoneOption={false}
            />
        </Field>
    );
}