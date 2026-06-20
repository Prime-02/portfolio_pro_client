"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Switch from "../../inputs/Switch";
import { Textinput } from "../../inputs/Textinput";
import { TagInput } from "./TagInput";
import { CreateProjectBottomNav } from "./CreateProjectBottomNav";
import type { CreateTab } from "./CreateProjectTabs";
import type { PortfolioProjectCreate } from "@/lib/stores/projects/types/project.types";

type FormState = PortfolioProjectCreate & { mediaSlots: Record<string, File | null> };

interface SettingRowProps {
    label: string;
    description: string;
    checked: boolean;
    onToggle: () => void;
}

function SettingRow({ label, description, checked, onToggle }: SettingRowProps) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--foreground)]/10">
            <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-[var(--foreground)]/40 mt-0.5">{description}</p>
            </div>
            <Switch isSwitched={checked} onSwitch={onToggle} />
        </div>
    );
}

interface SettingsTabProps {
    form: FormState;
    set: (key: keyof FormState, value: unknown) => void;
    activeTab: CreateTab;
    onTabChange: (tab: CreateTab) => void;
}

export function SettingsTab({ form, set, activeTab, onTabChange }: SettingsTabProps) {
    const [featuredInput, setFeaturedInput] = useState("");
    const featured_in = form.featured_in ?? [];

    const handleAddFeatured = (val: string) => {
        set("featured_in", [...featured_in.filter((f) => f !== val), val]);
        setFeaturedInput("");
    };

    return (
        <div className="space-y-6">
            <SettingRow
                label="Public Project"
                description="Visible to everyone on your profile"
                checked={form.is_public ?? false}
                onToggle={() => set("is_public", !form.is_public)}
            />

            <SettingRow
                label="Completed"
                description="Mark this project as finished"
                checked={form.is_completed ?? false}
                onToggle={() => set("is_completed", !form.is_completed)}
            />

            <SettingRow
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
                onRemove={(val) => set("featured_in", featured_in.filter((f) => f !== val))}
                chipVariant="accent"
                chipIcon={<Check className="w-3 h-3" />}
            />

            <CreateProjectBottomNav activeTab={activeTab} onChange={onTabChange} />
        </div>
    );
}