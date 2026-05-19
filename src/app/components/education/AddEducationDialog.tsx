"use client";

import { useState } from "react";
import { useEducation } from "@/lib/stores/education/useEducation";
import { DialogHeader, DialogTitle, DialogDescription } from "../ui/Dialog";
import { Textinput } from "../inputs/Textinput";
import Button from "../buttons/Buttons";
import Modal from "../containers/modals/Modal";
import { Plus } from "lucide-react";
import { FileInput } from "../inputs/FileInput";

interface AddEducationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddEducationDialog({ open, onOpenChange }: AddEducationDialogProps) {
    const { createEducation, isCreating } = useEducation();

    const [institution, setInstitution] = useState("");
    const [degree, setDegree] = useState("");
    const [fieldOfStudy, setFieldOfStudy] = useState("");
    const [startYear, setStartYear] = useState("");
    const [endYear, setEndYear] = useState("");
    const [isCurrent, setIsCurrent] = useState(false);
    const [description, setDescription] = useState("");
    const [institutionLogo, setInstitutionLogo] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!institution || !degree) return;

        await createEducation({
            institution,
            degree,
            field_of_study: fieldOfStudy || null,
            start_year: startYear || null,
            end_year: isCurrent ? null : endYear || null,
            is_current: isCurrent,
            description: description || null,
            institution_logo: institutionLogo,
        });

        resetForm();
        onOpenChange(false);
    };

    const resetForm = () => {
        setInstitution("");
        setDegree("");
        setFieldOfStudy("");
        setStartYear("");
        setEndYear("");
        setIsCurrent(false);
        setDescription("");
        setInstitutionLogo(null);
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
                        Add Education
                    </DialogTitle>
                    <DialogDescription>
                        Add your academic background and qualifications
                    </DialogDescription>
                </DialogHeader>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <Textinput
                    label="Institution"
                    placeholder="e.g., Harvard University"
                    value={institution}
                    onChange={(e) => setInstitution(e)}
                    required
                />

                <Textinput
                    label="Degree"
                    placeholder="e.g., Bachelor of Science"
                    value={degree}
                    onChange={(e) => setDegree(e)}
                    required
                />

                <Textinput
                    label="Field of Study"
                    placeholder="e.g., Computer Science"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e)}
                />

                <div className="grid grid-cols-2 gap-3">
                    <Textinput
                        type="date"
                        label="Start Date"
                        value={startYear}
                        onChange={(e) => setStartYear(e)}
                    />
                    <Textinput
                        type="date"
                        label="End Date"
                        value={endYear}
                        onChange={(e) => setEndYear(e)}
                        disabled={isCurrent}
                    />
                </div>

                {/* Current toggle */}
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl 
                                border border-[var(--foreground)]/10">
                    <div>
                        <p className="text-sm font-medium">Currently Studying</p>
                        <p className="text-xs text-[var(--foreground)]/50">
                            I am currently enrolled here
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsCurrent(!isCurrent)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isCurrent ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isCurrent ? "translate-x-6" : "translate-x-1"
                                }`}
                        />
                    </button>
                </div>

                <Textinput
                    label="Description (optional)"
                    placeholder="Additional details about your studies..."
                    value={description}
                    onChange={(e) => setDescription(e)}
                />

                {/* Institution logo upload */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Institution Logo (optional)
                    </label>
                    <FileInput
                        value={institutionLogo}
                        onChange={(file) => setInstitutionLogo(file)}
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
                        disabled={!institution || !degree || isCreating}
                        loading={isCreating}
                        text="Add Education"
                        icon={<Plus size={16} />}
                    />
                </div>
            </form>
        </Modal>
    );
}