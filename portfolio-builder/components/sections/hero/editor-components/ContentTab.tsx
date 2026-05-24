// portfolio-builder/components/sections/hero/editor-components/ContentTab.tsx

import { useState } from "react";
import { HeroData, HeroFonts, HeroTypography } from "@/portfolio-builder/types/hero";
import Field from './Field';
import FontPicker from './FontPicker';
import { inputClass } from './styles';
import { TypographyControl } from "./TypographyControl";
import { Textinput } from "@/src/app/components/inputs/Textinput";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

interface ContentTabProps {
    data: HeroData;
    onChange: <K extends keyof HeroData>(key: K, value: HeroData[K]) => void;
}

function CollapsibleSection({
    label,
    children,
    defaultOpen = false,
}: {
    label: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div
            className="rounded-sm overflow-hidden"
            style={{
                border: "1px solid var(--pb-border)",
                backgroundColor: "var(--pb-surface)",
            }}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors duration-150"
                style={{
                    backgroundColor: isOpen
                        ? "var(--pb-surface-elevated)"
                        : "transparent",
                }}
                onMouseEnter={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.backgroundColor = "var(--pb-surface-hover)";
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.backgroundColor = "transparent";
                    }
                }}
            >
                <span
                    className="text-[10px] tracking-[0.15em] font-mono uppercase"
                    style={{ color: "var(--pb-text-muted)" }}
                >
                    {label}
                </span>
                <span
                    className="text-[10px] transition-transform duration-200"
                    style={{
                        color: "var(--pb-text-muted)",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                >
                    ▼
                </span>
            </button>

            {isOpen && (
                <div className="px-3 pb-3 flex flex-col gap-3">
                    {children}
                </div>
            )}
        </div>
    );
}

export default function ContentTab({ data, onChange }: ContentTabProps) {
    const { userInfo } = useUserSettings()
    const updateFont = (field: keyof HeroFonts, family: string) => {
        onChange("fonts", { ...data.fonts, [field]: family || undefined });
    };

    const updateTypography = (field: keyof HeroFonts, typography: HeroTypography) => {
        onChange("typography", {
            ...data.typography,
            [field]: typography,
        });
    };

    return (
        <div className="flex flex-col gap-4">
            {/* ── Greeting ── */}
            <Textinput
                label="Greeting"
                id="greeting"
                type="text"
                value={data.greeting || ""}
                onChange={(e) => onChange("greeting", e)}
                placeholder='e.g. "Hi, my name is"'
                className={inputClass}
            />

            <CollapsibleSection label="Greeting Styling">
                <Field label="Font Family" htmlFor="font-greeting">
                    <FontPicker
                        id="font-greeting"
                        value={data.fonts?.greeting || ""}
                        onChange={(family) => updateFont("greeting", family)}
                        previewText={data.greeting || "Hi, my name is"}
                    />
                </Field>

                <TypographyControl
                    label="Typography"
                    value={data.typography?.greeting ?? {}}
                    onChange={(t) => updateTypography("greeting", t)}
                />
            </CollapsibleSection>

            {/* ── Name ── */}
            <Textinput
                label="Name"
                id="name"
                type="text"
                value={data.name || ""}
                onChange={(e) => onChange("name", e)}
                placeholder="Your full name"
                className={inputClass}
                required
            />

            <CollapsibleSection label="Name Styling">
                <Field label="Font Family" htmlFor="font-name">
                    <FontPicker
                        id="font-name"
                        value={data.fonts?.name || ""}
                        onChange={(family) => updateFont("name", family)}
                        previewText={data.name || "Your Name"}
                    />
                </Field>

                <TypographyControl
                    label="Typography"
                    value={data.typography?.name ?? {}}
                    onChange={(t) => updateTypography("name", t)}
                />
            </CollapsibleSection>

            {/* ── Title ── */}
            <Textinput
                label="Title / Role"
                id="title"
                type="text"
                value={data.title || ""}
                onChange={(e) => onChange("title", e)}
                placeholder='e.g. "Full Stack Developer"'
                className={inputClass}
            />

            <CollapsibleSection label="Title Styling">
                <Field label="Font Family" htmlFor="font-title">
                    <FontPicker
                        id="font-title"
                        value={data.fonts?.title || ""}
                        onChange={(family) => updateFont("title", family)}
                        previewText={data.title || "Full Stack Developer"}
                    />
                </Field>

                <TypographyControl
                    label="Typography"
                    value={data.typography?.title ?? {}}
                    onChange={(t) => updateTypography("title", t)}
                />
            </CollapsibleSection>
        </div>
    );
}