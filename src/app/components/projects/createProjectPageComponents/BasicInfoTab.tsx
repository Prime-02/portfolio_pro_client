"use client";

import { useState } from "react";
import { Textinput } from "../../inputs/Textinput";
import MarkdownEditor from "../../markdown/MarkdownEditor";
import { TagInput } from "./TagInput";
import { CreateProjectBottomNav } from "./CreateProjectBottomNav";
import type { CreateTab } from "./CreateProjectTabs";
import type { PortfolioProjectCreate } from "@/lib/stores/projects/types/project.types";
import { TextArea } from "../../inputs/TextArea";

type FormState = PortfolioProjectCreate & { mediaSlots: Record<string, File | null> };

interface BasicInfoTabProps {
    form: FormState;
    set: (key: keyof FormState, value: unknown) => void;
    activeTab: CreateTab;
    onTabChange: (tab: CreateTab) => void;
}

export function BasicInfoTab({ form, set, activeTab, onTabChange }: BasicInfoTabProps) {
    const [stackInput, setStackInput] = useState("");
    const [tagInput, setTagInput] = useState("");

    const stack = form.stack ?? [];
    const tags = form.tags ?? [];

    const handleAddStack = (val: string) => {
        set("stack", [...stack.filter((t) => t !== val), val]);
        setStackInput("");
    };

    const handleAddTag = (val: string) => {
        set("tags", [...tags.filter((t) => t !== val), val]);
        setTagInput("");
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textinput
                    label="Project Name"
                    desc="e.g., E-commerce Dashboard"
                    value={form.project_name}
                    onChange={(v) => set("project_name", v)}
                    required
                    maxLength={500}
                />
                <Textinput
                    label="Platform"
                    desc="e.g., Web, Mobile, Desktop"
                    value={form.project_platform}
                    onChange={(v) => set("project_platform", v)}
                    required
                    maxLength={100}
                />
            </div>

            <Textinput
                label="Category"
                desc="e.g., SaaS, E-commerce, AI Tool"
                value={form.project_category ?? ""}
                onChange={(v) => set("project_category", v)}
                maxLength={100}
            />

            <TextArea
                label="Project Summary"
                desc="A brief summary of the project (max 500 characters)"
                value={form.project_summary ?? ""}
                onChange={(v) => set("project_summary", v)}
                maxLength={500}
            />

            <MarkdownEditor
                label="Description"
                hint="What does this project do?"
                value={form.project_description ?? ""}
                onChange={(v) => set("project_description", v)}
                minHeight="100px"
            />

            <TextArea
                label="Your Contribution"
                desc="What was your role in this project?"
                value={form.contribution_description ?? ""}
                onChange={(v) => set("contribution_description", v)}
            />

            <Textinput
                label="Project URL"
                desc="https://..."
                value={form.project_url ?? ""}
                onChange={(v) => set("project_url", v)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textinput
                    type="date"
                    label="Start Date"
                    value={form.start_date ?? ""}
                    onChange={(v) => set("start_date", v)}
                />
                <Textinput
                    type="date"
                    label="End Date"
                    value={form.end_date ?? ""}
                    onChange={(v) => set("end_date", v)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textinput
                    label="Client"
                    desc="Who was this for?"
                    value={form.client_name ?? ""}
                    onChange={(v) => set("client_name", v)}
                />
                <Textinput
                    type="number"
                    label="Budget"
                    desc="Approximate budget in USD"
                    value={form.budget?.toString() ?? ""}
                    onChange={(v) => set("budget", v ? Number(v) : undefined)}
                />
            </div>

            <TagInput
                label="Tech Stack"
                placeholder="Add technology and press Enter"
                items={stack}
                inputValue={stackInput}
                onInputChange={setStackInput}
                onAdd={handleAddStack}
                onRemove={(val) => set("stack", stack.filter((t) => t !== val))}
                chipVariant="accent"
            />

            <TagInput
                label="Tags"
                placeholder="Add tag and press Enter"
                items={tags}
                inputValue={tagInput}
                onInputChange={setTagInput}
                onAdd={handleAddTag}
                onRemove={(val) => set("tags", tags.filter((t) => t !== val))}
                chipVariant="muted"
            />

            <CreateProjectBottomNav activeTab={activeTab} onChange={onTabChange} />
        </>
    );
}