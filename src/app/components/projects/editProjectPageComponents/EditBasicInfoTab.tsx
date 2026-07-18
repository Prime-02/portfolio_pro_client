// components/projects/editProjectPageComponents/EditBasicInfoTab.tsx
"use client";

import { useState } from "react";
import { Textinput } from "../../inputs/Textinput";
import MarkdownEditor from "../../markdown/MarkdownEditor";
import { TagInput } from "../createProjectPageComponents/TagInput";
import { TextArea } from "../../inputs/TextArea";
import Dropdown from "../../inputs/DynamicDropdown";
import AIAssistant from "../../ai/AIAsistant";
import { projectCategory } from "@/lib/utilities/indices/projects-JSONs/projectCreate";
import { getProjectSummaryPromptOptions, getProjectDescriptionPromptOptions } from "../projectPromptOptions";
import type { PortfolioProjectUpdate } from "@/lib/stores/projects/types/project.types";
import { toast } from "../../../../context/Toastify";

type FormState = PortfolioProjectUpdate & { mediaSlots: Record<string, File | null> };

interface EditBasicInfoTabProps {
    form: FormState;
    projectPlatform: string;
    set: (key: keyof FormState, value: unknown) => void;
}

export function EditBasicInfoTab({ form, projectPlatform, set }: EditBasicInfoTabProps) {
    const [stackInput, setStackInput] = useState("");
    const [tagInput, setTagInput] = useState("");

    const stack = form.stack ?? [];
    const tags = form.tags ?? [];

    // Handle adding stack item - removes duplicate and adds new one at the end
    const handleAddStack = (val: string) => {
        set("stack", [...stack.filter((t) => t !== val), val]);
        setStackInput("");
    };

    // Handle adding tag - removes duplicate and adds new one at the end
    const handleAddTag = (val: string) => {
        set("tags", [...tags.filter((t) => t !== val), val]);
        setTagInput("");
    };

    const formattedCategory = () => projectCategory.map((category) => ({
        id: category.code,
        code: category.code
    }))

    return (
        <>
            <div className="grid grid-cols-1 gap-4">
                <Textinput
                    label="Project Name"
                    value={form.project_name ?? ""}
                    onChange={(v) => set("project_name", v)}
                    required
                    maxLength={500}
                />
            </div>

            <Dropdown
                label="Category"
                value={form.project_category ?? ""}
                onSelect={(v) => set("project_category", v)}
                type="datalist"
                options={formattedCategory()}
                includeNoneOption={false}
                includeQueryAsOption
            />

            <div className="relative">
                <TextArea
                    label="Summary"
                    value={form.project_summary ?? ""}
                    onChange={(v) => set("project_summary", v)}
                    maxLength={500}
                />
                <div className="absolute bottom-3 right-3">
                    <AIAssistant
                        options={getProjectSummaryPromptOptions({
                            project_name: form.project_name || "",
                            project_category: form.project_category || "",
                            project_summary: form.project_summary || "",
                            project_description: form.project_description || "",
                            project_url: form.project_url || "",
                            start_date: form.start_date,
                            end_date: form.end_date,
                            client_name: form.client_name || "",
                            budget: form.budget,
                            stack: form.stack,
                            tags: form.tags,
                        }, form.project_summary ?? "")}
                        onChange={(v) => set("project_summary", v)}
                        onEmptyClick={() => {
                            toast.info(
                                "Please fill in the project name and category first to unlock AI-powered suggestions for your summary.",
                                { title: "AI Assistant Unavailable" }
                            );
                        }}
                    />
                </div>
            </div>

            <div className="relative">
                <MarkdownEditor
                    label="Description"
                    value={form.project_description ?? ""}
                    onChange={(v) => set("project_description", v)}
                />
                <div className="absolute bottom-3 right-3 z-10">
                    <AIAssistant
                        options={getProjectDescriptionPromptOptions({
                            project_name: form.project_name || "",
                            project_category: form.project_category || "",
                            project_summary: form.project_summary || "",
                            project_description: form.project_description || "",
                            project_url: form.project_url || "",
                            start_date: form.start_date,
                            end_date: form.end_date,
                            client_name: form.client_name || "",
                            budget: form.budget,
                            stack: form.stack,
                            tags: form.tags,
                        }, form.project_description ?? "")}
                        onChange={(v) => set("project_description", v)}
                        onEmptyClick={() => {
                            toast.info(
                                "Please provide a project name and category to enable AI-powered description suggestions.",
                                { title: "AI Assistant Unavailable" }
                            );
                        }}
                    />
                </div>
            </div>

            <Textinput
                label="Project URL"
                value={form.project_url ?? ""}
                onChange={(v) => set("project_url", v)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textinput
                    type="date"
                    label="Start Date"
                    value={form.start_date ?? ""}
                    onChange={(v) => set("start_date", v || null)}
                />
                <Textinput
                    type="date"
                    label="End Date"
                    value={form.end_date ?? ""}
                    onChange={(v) => set("end_date", v || null)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textinput
                    label="Client"
                    value={form.client_name ?? ""}
                    onChange={(v) => set("client_name", v)}
                />
                <Textinput
                    type="number"
                    label="Budget"
                    value={form.budget?.toString() ?? ""}
                    onChange={(v) => set("budget", v ? Number(v) : null)}
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
        </>
    );
}