"use client";

import { useState, useEffect } from "react";
import { useSkills } from "@/lib/stores/skills/useSkills";
import type { ProfessionalSkill } from "@/lib/stores/skills/useSkills";
import { Save, Zap, TrendingUp, Award } from "lucide-react";
import { Textinput } from "../inputs/Textinput";
import Button from "../buttons/Buttons";
import Modal from "../containers/modals/Modal";
import { DialogHeader, DialogTitle, DialogDescription } from "../ui/Dialog";
import { FileInput } from "../inputs/FileInput";
import { difficultyLevels } from "@/lib/utilities/indices/DropDownItems";
import Dropdown from "../inputs/DynamicDropdown";

interface EditSkillDialogProps {
    skill: ProfessionalSkill;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const PROFICIENCY_LEVELS = [
    { value: "Beginner", label: "Beginner", color: "#22c55e", icon: Zap },
    { value: "Intermediate", label: "Intermediate", color: "#3b82f6", icon: TrendingUp },
    { value: "Expert", label: "Expert", color: "#a855f7", icon: Award },
];

export function EditSkillDialog({ skill, open, onOpenChange }: EditSkillDialogProps) {
    const { updateSkill, isUpdating, categories, subcategories } = useSkills();


    const categoryOptions = categories.map((category) => ({
        id: category,
        code: category
    }))

    const subCategoryOptions = subcategories.map((subCategory) => ({
        id: subCategory,
        code: subCategory
    }))


    const [skillName, setSkillName] = useState(skill.skill_name);
    const [proficiencyLevel, setProficiencyLevel] = useState(skill.proficiency_level);
    const [category, setCategory] = useState(skill.category ?? "");
    const [subcategory, setSubcategory] = useState(skill.subcategory ?? "");
    const [description, setDescription] = useState(skill.description ?? "");
    const [difficultyLevel, setDifficultyLevel] = useState(skill.difficulty_level ?? "");
    const [isMajor, setIsMajor] = useState(skill.is_major ?? false);
    const [skillLogo, setSkillLogo] = useState<File | null>(null);

    useEffect(() => {
        setSkillName(skill.skill_name);
        setProficiencyLevel(skill.proficiency_level);
        setCategory(skill.category ?? "");
        setSubcategory(skill.subcategory ?? "");
        setDescription(skill.description ?? "");
        setDifficultyLevel(skill.difficulty_level ?? "");
        setIsMajor(skill.is_major ?? false);
    }, [skill]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!skill.id) return;

        await updateSkill(skill.id, {
            skill_name: skillName || "",
            proficiency_level: proficiencyLevel || "",
            category: category || "",
            subcategory: subcategory || "",
            description: description || "",
            difficulty_level: difficultyLevel || "",
            is_major: isMajor,
            skill_logo: skillLogo,
        });
        onOpenChange(false);
    };

    const resetForm = () => {
        setSkillName(skill.skill_name);
        setProficiencyLevel(skill.proficiency_level);
        setCategory(skill.category ?? "");
        setSubcategory(skill.subcategory ?? "");
        setDescription(skill.description ?? "");
        setDifficultyLevel(skill.difficulty_level ?? "");
        setIsMajor(skill.is_major ?? false);
        setSkillLogo(null);
    };

    return (
        <Modal
            isOpen={open}
            onClose={() => {
                resetForm();
                onOpenChange(false);
            }}
            title={
                <DialogHeader>
                    <DialogTitle className="font-league-600 text-xl">
                        Edit Skill
                    </DialogTitle>
                    <DialogDescription>
                        Update your skill details
                    </DialogDescription>
                </DialogHeader>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                <Textinput
                    label="Skill Name"
                    value={skillName}
                    onChange={(e) => setSkillName(e)}
                    required
                />

                {/* Proficiency Level - Visual Selector */}
                <div>
                    <label className="block text-sm font-medium mb-3">
                        Proficiency Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {PROFICIENCY_LEVELS.map((level) => {
                            const Icon = level.icon;
                            const isSelected = proficiencyLevel === level.value;
                            return (
                                <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => setProficiencyLevel(level.value)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                                                ${isSelected
                                            ? "border-[var(--accent)] bg-[var(--accent)]/5"
                                            : "border-[var(--foreground)]/10 hover:border-[var(--foreground)]/30"
                                        }`}
                                >
                                    <Icon
                                        className="w-5 h-5"
                                        style={{ color: isSelected ? level.color : "var(--foreground)" }}
                                    />
                                    <span className={`text-xs font-medium ${isSelected ? "text-[var(--foreground)]" : "text-[var(--foreground)]/50"}`}>
                                        {level.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Dropdown
                        placeholder="Select or enter a new category"
                        label="Category"
                        type="datalist"
                        options={categoryOptions}
                        includeQueryAsOption
                        emptyMessage="Create at least one category to include here."
                        value={category}
                        onSelect={(e: string | string[]) => setCategory(e as string)}
                    />
                    <Dropdown
                        placeholder="Select or enter a new sub category"
                        label="Subcategory"
                        value={subcategory}
                        onSelect={(e: string | string[]) => setSubcategory(e as string)}
                        emptyMessage="Create at least one category to include here."
                        includeQueryAsOption
                        options={subCategoryOptions}
                        type="datalist"
                    />
                </div>

                <Textinput
                    type="dropdown"
                    options={difficultyLevels}
                    label="Difficulty Level"
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(e)}
                />

                <Textinput
                    label="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e)}
                />

                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl 
                                border border-[var(--foreground)]/10">
                    <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-[var(--accent)]" />
                        <div>
                            <p className="text-sm font-medium">Major Skill</p>
                            <p className="text-xs text-[var(--foreground)]/50">
                                Highlight as a core competency
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsMajor(!isMajor)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isMajor ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isMajor ? "translate-x-6" : "translate-x-1"
                                }`}
                        />
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Skill Logo (optional)
                    </label>
                    <FileInput
                        value={skillLogo || skill.skill_logo_url || null}
                        onChange={(file) => setSkillLogo(file)}
                    />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            resetForm();
                            onOpenChange(false);
                        }}
                        text="Cancel"
                    />
                    <Button
                        icon={<Save size={16} />}
                        type="submit"
                        disabled={isUpdating || !skillName || !proficiencyLevel}
                        loading={isUpdating}
                        text="Save Changes"
                    />
                </div>
            </form>
        </Modal>
    );
}