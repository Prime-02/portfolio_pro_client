"use client";

import { useState } from "react";
import { useSkills } from "@/lib/stores/skills/useSkills";
import { DialogHeader, DialogTitle, DialogDescription } from "../ui/Dialog";
import { Textinput } from "../inputs/Textinput";
import Button from "../buttons/Buttons";
import Modal from "../containers/modals/Modal";
import { Plus, Zap, TrendingUp, Award } from "lucide-react";
import { FileInput } from "../inputs/FileInput";
import { TextArea } from "../inputs/TextArea";
import { difficultyLevels } from "@/lib/utilities/indices/DropDownItems";

interface AddSkillDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const PROFICIENCY_LEVELS = [
    { value: "Beginner", label: "Beginner", color: "#22c55e", icon: Zap },
    { value: "Intermediate", label: "Intermediate", color: "#3b82f6", icon: TrendingUp },
    { value: "Expert", label: "Expert", color: "#a855f7", icon: Award },
];

export function AddSkillDialog({ open, onOpenChange }: AddSkillDialogProps) {
    const { createSkill, isCreating } = useSkills();

    const [skillName, setSkillName] = useState("");
    const [proficiencyLevel, setProficiencyLevel] = useState("Beginner");
    const [category, setCategory] = useState("");
    const [subcategory, setSubcategory] = useState("");
    const [description, setDescription] = useState("");
    const [difficultyLevel, setDifficultyLevel] = useState("");
    const [isMajor, setIsMajor] = useState(false);
    const [skillLogo, setSkillLogo] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!skillName || !proficiencyLevel) return;

        await createSkill({
            skill_name: skillName,
            proficiency_level: proficiencyLevel,
            category: category || "",
            subcategory: subcategory || "",
            description: description || "",
            difficulty_level: difficultyLevel || "",
            is_major: isMajor,
            skill_logo: skillLogo,
        });

        resetForm();
        onOpenChange(false);
    };

    const resetForm = () => {
        setSkillName("");
        setProficiencyLevel("Beginner");
        setCategory("");
        setSubcategory("");
        setDescription("");
        setDifficultyLevel("");
        setIsMajor(false);
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
                        Add Skill
                    </DialogTitle>
                    <DialogDescription>
                        Showcase your expertise and abilities
                    </DialogDescription>
                </DialogHeader>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                <Textinput
                    label="Skill Name"
                    desc="e.g., React, Project Management, Spanish"
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
                    <Textinput
                        label="Category"
                        desc="e.g., Programming"
                        value={category}
                        onChange={(e) => setCategory(e)}
                    />
                    <Textinput
                        label="Subcategory"
                        desc="e.g., Frontend"
                        value={subcategory}
                        onChange={(e) => setSubcategory(e)}
                    />
                </div>

                <Textinput
                    type="dropdown"
                    options={difficultyLevels}
                    label="Difficulty Level"
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(e)}
                />

                <TextArea
                    label="Description (optional)"
                    desc="Describe your experience with this skill..."
                    value={description}
                    onChange={(e) => setDescription(e)}
                />

                {/* Major Skill Toggle */}
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

                {/* Skill Logo Upload */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Skill Logo (optional)
                    </label>
                    <FileInput
                        value={skillLogo}
                        onChange={(file) => setSkillLogo(file)}
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
                        disabled={!skillName || !proficiencyLevel || isCreating}
                        loading={isCreating}
                        text="Add Skill"
                        icon={<Plus size={16} />}
                    />
                </div>
            </form>
        </Modal>
    );
}