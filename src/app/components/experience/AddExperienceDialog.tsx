// components/experience/AddExperienceDialog.tsx
"use client";

import { useState } from "react";
import { useExperiencesStore } from "@/lib/stores/experiences/useExperience";
import { DialogHeader, DialogTitle, DialogDescription } from "../ui/Dialog";
import { Textinput } from "../inputs/Textinput";
import { TextArea } from "../inputs/TextArea";
import Button from "../buttons/Buttons";
import Modal from "../containers/modals/Modal";
import { FileInput } from "../inputs/FileInput";
import { Plus, Award, Briefcase } from "lucide-react";
import AIAssistant from "../ai/AIAsistant";
import { getExperienceAchievementsPromptOptions, getExperienceDescriptionPromptOptions } from "./experiencePromptOption";
import {
    EmploymentType,
    LocationType,
    CompanySize,
} from "@/lib/stores/experiences/useExperience";
import { useSkills } from "@/lib/stores/skills/useSkills";
import Dropdown, { DropdownOption } from "../inputs/DynamicDropdown";
import { toast } from "../toastify/Toastify";

interface AddExperienceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const EMPLOYMENT_TYPE_OPTIONS = Object.values(EmploymentType).map((v) => ({
    id: v,
    code: v
        .split("_")
        .map((w) => w[0] + w.slice(1).toLowerCase())
        .join(" "),
}));

const LOCATION_TYPE_OPTIONS = Object.values(LocationType).map((v) => ({
    id: v,
    code: v
        .split("_")
        .map((w) => w[0] + w.slice(1).toLowerCase())
        .join(" "),
}));

const COMPANY_SIZE_OPTIONS = Object.values(CompanySize).map((v) => ({
    id: v,
    code: v[0] + v.slice(1).toLowerCase(),
}));

const INITIAL_FORM = {
    company_name: "",
    job_title: "",
    employment_type: "" as EmploymentType | "",
    location: "",
    location_type: "" as LocationType | "",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
    achievements: "",      // newline-delimited for UX, split on submit
    responsibilities: "",
    skills_used: "",       // comma-delimited
    company_website: "",
    company_size: "" as CompanySize | "",
    industry: "",
    is_public: true,
    is_featured: false,
};

export function AddExperienceDialog({ open, onOpenChange }: AddExperienceDialogProps) {
    const { createExperience, creating } = useExperiencesStore();
    const { skills, isLoading: loadingSkills } = useSkills();

    const skillsOptions: DropdownOption[] = skills.map(skill => ({
        id: skill.skill_name,
        code: skill.skill_name.toUpperCase()
    }));

    const [form, setForm] = useState(INITIAL_FORM);
    const [companyLogo, setCompanyLogo] = useState<File | null>(null);

    const set = (key: keyof typeof INITIAL_FORM, value: string | boolean) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const resetForm = () => {
        setForm(INITIAL_FORM);
        setCompanyLogo(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.company_name || !form.job_title || !form.start_date) return;

        const achievements = form.achievements
            ? form.achievements.split("\n").map((s) => s.trim()).filter(Boolean)
            : undefined;
        const responsibilities = form.responsibilities
            ? form.responsibilities.split("\n").map((s) => s.trim()).filter(Boolean)
            : undefined;
        const skills_used = form.skills_used
            ? form.skills_used.split(",").map((s) => s.trim()).filter(Boolean)
            : undefined;

        await createExperience(
            {
                company_name: form.company_name,
                job_title: form.job_title,
                employment_type: (form.employment_type as EmploymentType) || undefined,
                location: form.location || undefined,
                location_type: (form.location_type as LocationType) || undefined,
                start_date: form.start_date,
                end_date: form.is_current ? undefined : form.end_date || undefined,
                is_current: form.is_current,
                description: form.description || undefined,
                achievements,
                responsibilities,
                skills_used,
                company_website: form.company_website || undefined,
                company_size: (form.company_size as CompanySize) || undefined,
                industry: form.industry || undefined,
                is_public: form.is_public,
                is_featured: form.is_featured,
            },
            companyLogo ?? undefined,
        );

        resetForm();
        onOpenChange(false);
    };

    // Handler for skills multi-select
    const handleSkillsChange = (values: string | string[]) => {
        if (Array.isArray(values)) {
            // Convert array to comma-separated string
            const commaSeparated = values.join(", ");
            set("skills_used", commaSeparated);
        } else {
            // Handle single value (shouldn't happen with multiple=true, but just in case)
            set("skills_used", values);
        }
    };

    // Parse comma-separated skills back to array for the multi-select value prop
    const skillsValue = form.skills_used
        ? form.skills_used.split(",").map(s => s.trim()).filter(Boolean)
        : [];

    return (
        <Modal
            isOpen={open}
            onClose={() => { resetForm(); onOpenChange(false); }}
            title={
                <DialogHeader>
                    <DialogTitle className="font-league-600 text-xl">
                        Add Experience
                    </DialogTitle>
                    <DialogDescription>
                        Document a role in your professional journey
                    </DialogDescription>
                </DialogHeader>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                {/* Core fields */}
                <div className="grid grid-cols-2 gap-3">
                    <Textinput
                        label="Job Title"
                        desc="e.g., Senior Engineer"
                        value={form.job_title}
                        onChange={(v) => set("job_title", v)}
                        required
                    />
                    <Textinput
                        label="Company"
                        desc="e.g., Acme Corp"
                        value={form.company_name}
                        onChange={(v) => set("company_name", v)}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Textinput
                        type="dropdown"
                        options={EMPLOYMENT_TYPE_OPTIONS}
                        label="Employment Type"
                        value={form.employment_type}
                        onChange={(v) => set("employment_type", v)}
                    />
                    <Textinput
                        type="dropdown"
                        options={LOCATION_TYPE_OPTIONS}
                        label="Work Mode"
                        value={form.location_type}
                        onChange={(v) => set("location_type", v)}
                    />
                </div>

                <Textinput
                    label="Location"
                    desc="City, Country"
                    value={form.location}
                    onChange={(v) => set("location", v)}
                />

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                    <Textinput
                        type="date"
                        label="Start Date"
                        value={form.start_date}
                        onChange={(v) => set("start_date", v)}
                        required
                    />
                    {!form.is_current && (
                        <Textinput
                            type="date"
                            label="End Date"
                            value={form.end_date}
                            onChange={(v) => set("end_date", v)}
                        />
                    )}
                </div>

                {/* Currently working toggle */}
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-[var(--foreground)]/10">
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[var(--accent)]" />
                        <div>
                            <p className="text-sm font-medium">Currently working here</p>
                            <p className="text-xs text-[var(--foreground)]/50">
                                Marks this as your active role
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => set("is_current", !form.is_current)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_current ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_current ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                </div>

                {/* Skills Dropdown with Multi-Select */}
                <Dropdown
                    type="datalist"
                    multiple={true}
                    placeholder="Skills Used (optional)"
                    options={skillsOptions}
                    loading={loadingSkills}
                    value={skillsValue}
                    onSelect={handleSkillsChange}
                    tag="skill"
                    selectAll={skillsOptions.length > 3}
                    emptyMessage="No skills available"
                />

                <div className="grid grid-cols-2 gap-3">
                    <Textinput
                        label="Industry (optional)"
                        desc="e.g., Fintech, SaaS"
                        value={form.industry}
                        onChange={(v) => set("industry", v)}
                    />
                    <Textinput
                        type="dropdown"
                        options={COMPANY_SIZE_OPTIONS}
                        label="Company Size"
                        value={form.company_size}
                        onChange={(v) => set("company_size", v)}
                    />
                </div>

                <Textinput
                    label="Company Website (optional)"
                    desc="https://..."
                    value={form.company_website}
                    onChange={(v) => set("company_website", v)}
                />

                {/* Description with AI Assistant */}
                <div className="relative">
                    <TextArea
                        label="Description (optional)"
                        desc="What did you do in this role?"
                        value={form.description}
                        onChange={(v) => set("description", v)}
                        maxLength={Infinity}
                        showLimit={false}
                    />
                    <div className="absolute bottom-3 right-3">
                        <AIAssistant
                            options={getExperienceDescriptionPromptOptions({
                                job_title: form.job_title,
                                company_name: form.company_name,
                                employment_type: form.employment_type,
                                location_type: form.location_type,
                                location: form.location,
                                start_date: form.start_date,
                                end_date: form.end_date,
                                is_current: form.is_current,
                                industry: form.industry,
                                company_size: form.company_size,
                                skills_used: form.skills_used,
                            }, form.description)}
                            onChange={(v) => set("description", v)}
                            onEmptyClick={() => {
                                toast.info("Job title, company name and start date are required to generate a response", {
                                    title: "Counld not generate a response"
                                })
                            }}
                        />
                    </div>
                </div>

                {/* Achievements with AI Assistant */}
                <div className="relative">
                    <TextArea
                        label="Achievements (optional)"
                        desc="One per line — e.g., Increased performance by 40%"
                        value={form.achievements}
                        onChange={(v) => set("achievements", v)}
                        maxLength={Infinity}
                        showLimit={false}
                    />
                    <div className="absolute bottom-3 right-3">
                        <AIAssistant
                            options={getExperienceAchievementsPromptOptions({
                                job_title: form.job_title,
                                company_name: form.company_name,
                                employment_type: form.employment_type,
                                location_type: form.location_type,
                                location: form.location,
                                start_date: form.start_date,
                                end_date: form.end_date,
                                is_current: form.is_current,
                                industry: form.industry,
                                company_size: form.company_size,
                                skills_used: form.skills_used,
                                description: form.description,
                            }, form.achievements)}
                            onChange={(v) => set("achievements", v)}
                            onEmptyClick={() => {
                                toast.info("Job title, company name and start date are required to generate a response", {
                                    title: "Counld not generate a response"
                                })
                            }}
                        />
                    </div>
                </div>

                {/* Featured toggle */}
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-[var(--foreground)]/10">
                    <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-[var(--accent)]" />
                        <div>
                            <p className="text-sm font-medium">Featured Role</p>
                            <p className="text-xs text-[var(--foreground)]/50">
                                Highlight as a standout position
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => set("is_featured", !form.is_featured)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_featured ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_featured ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                </div>

                {/* Company logo - Last before buttons */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Company Logo (optional)
                    </label>
                    <FileInput
                        value={companyLogo}
                        onChange={(file) => setCompanyLogo(file)}
                    />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => { resetForm(); onOpenChange(false); }}
                        text="Cancel"
                    />
                    <Button
                        type="submit"
                        disabled={!form.company_name || !form.job_title || !form.start_date || creating}
                        loading={creating}
                        text="Add Experience"
                        icon={<Plus size={16} />}
                    />
                </div>
            </form>
        </Modal>
    );
}