// portfolio-builder/components/sections/hero/editor-components/ContentTab.tsx

import { useState } from "react";
import { HeroData, HeroFonts, HeroTypography } from "@/portfolio-builder/types/hero";
import Field from './Field';
import FontPicker from './FontPicker';
import { inputClass } from './styles';
import { TypographyControl } from "./TypographyControl";

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
                border: "1px solid rgba(var(--foreground-rgb,255,255,255),0.08)",
                backgroundColor: "rgba(var(--foreground-rgb,255,255,255),0.02)",
            }}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors duration-150"
                style={{
                    backgroundColor: isOpen
                        ? "rgba(var(--foreground-rgb,255,255,255),0.04)"
                        : "transparent",
                }}
                onMouseEnter={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.backgroundColor = "rgba(var(--foreground-rgb,255,255,255),0.03)";
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
                    style={{ opacity: 0.5 }}
                >
                    {label}
                </span>
                <span
                    className="text-[10px] transition-transform duration-200"
                    style={{
                        opacity: 0.4,
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
            <Field label="Greeting" htmlFor="greeting">
                <input
                    id="greeting"
                    type="text"
                    value={data.greeting || ""}
                    onChange={(e) => onChange("greeting", e.target.value)}
                    placeholder='e.g. "Hi, my name is"'
                    className={inputClass}
                />
            </Field>

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
            <Field label="Name" htmlFor="name" required>
                <input
                    id="name"
                    type="text"
                    value={data.name || ""}
                    onChange={(e) => onChange("name", e.target.value)}
                    placeholder="Your full name"
                    className={inputClass}
                />
            </Field>

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
            <Field label="Title / Role" htmlFor="title">
                <input
                    id="title"
                    type="text"
                    value={data.title || ""}
                    onChange={(e) => onChange("title", e.target.value)}
                    placeholder='e.g. "Full Stack Developer"'
                    className={inputClass}
                />
            </Field>

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