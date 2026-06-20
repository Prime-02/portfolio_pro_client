"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Textinput } from "../../inputs/Textinput";
import { TagInput } from "../createProjectPageComponents/TagInput";
import type { PortfolioProjectUpdate } from "@/lib/stores/projects/types/project.types";
import Switch from "../../inputs/Switch";

type FormState = PortfolioProjectUpdate & { mediaSlots: Record<string, File | null> };

// ─── ToggleRow ────────────────────────────────────────────────────────────────

interface ToggleRowProps {
    label: string;
    description: string;
    checked: boolean;
    onToggle: () => void;
}

export function ToggleRow({
    label,
    description,
    checked,
    onToggle,
}: ToggleRowProps) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--foreground)]/10">
            <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-[var(--foreground)]/40 mt-0.5">{description}</p>
            </div>
            <Switch
                isSwitched={checked}
                onSwitch={onToggle}
            />
        </div>
    );
}

// ─── EditSettingsTab ──────────────────────────────────────────────────────────

interface EditSettingsTabProps {
    form: FormState;
    set: (key: keyof FormState, value: unknown) => void;
}

export function EditSettingsTab({ form, set }: EditSettingsTabProps) {
    const [featuredInput, setFeaturedInput] = useState("");
    const featured_in = form.featured_in ?? [];

    // Handle adding featured item - removes duplicate and adds new one at the end
    const handleAddFeatured = (val: string) => {
        set("featured_in", [...featured_in.filter((f) => f !== val), val]);
        setFeaturedInput("");
    };

    return (
        <div className="space-y-6">
            <ToggleRow
                label="Public Project"
                description="Visible to everyone on your profile"
                checked={form.is_public ?? false}
                onToggle={() => set("is_public", !form.is_public)}
            />

            <ToggleRow
                label="Completed"
                description="Mark this project as finished"
                checked={form.is_completed ?? false}
                onToggle={() => set("is_completed", !form.is_completed)}
            />

            <ToggleRow
                label="Concept / Idea"
                description="This is a work in progress or idea"
                checked={form.is_concept ?? false}
                onToggle={() => set("is_concept", !form.is_concept)}
            />

            <Textinput
                type="dropdown"
                label="Status"
                options={[
                    { id: "active", code: "Active" },
                    { id: "archived", code: "Archived" },
                    { id: "draft", code: "Draft" },
                ]}
                value={form.status ?? "active"}
                onChange={(v) => set("status", v)}
            />

            <TagInput
                label="Featured In"
                placeholder="e.g., Product Hunt, TechCrunch"
                items={featured_in}
                inputValue={featuredInput}
                onInputChange={setFeaturedInput}
                onAdd={handleAddFeatured}
                onRemove={(val) =>
                    set("featured_in", featured_in.filter((f) => f !== val))
                }
                chipVariant="accent"
                chipIcon={<Check className="w-3 h-3" />}
            />
        </div>
    );
}