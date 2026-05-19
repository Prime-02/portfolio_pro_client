"use client";

import { useState, useEffect } from "react";
import { useEducation } from "@/lib/stores/education/useEducation";
import type { Education } from "@/lib/stores/education/useEducation";
import { Save } from "lucide-react";
import { Textinput } from "../inputs/Textinput";
import Button from "../buttons/Buttons";
import Modal from "../containers/modals/Modal";
import { DialogHeader, DialogTitle, DialogDescription } from "../ui/Dialog";
import { FileInput } from "../inputs/FileInput";

interface EditEducationDialogProps {
    education: Education;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditEducationDialog({ education, open, onOpenChange }: EditEducationDialogProps) {
    const { updateEducation, isUpdating } = useEducation();

    const [institution, setInstitution] = useState(education.institution);
    const [degree, setDegree] = useState(education.degree);
    const [fieldOfStudy, setFieldOfStudy] = useState(education.field_of_study ?? "");
    const [startYear, setStartYear] = useState(education.start_year ?? "");
    const [endYear, setEndYear] = useState(education.end_year ?? "");
    const [isCurrent, setIsCurrent] = useState(education.is_current);
    const [description, setDescription] = useState(education.description ?? "");
    const [institutionLogo, setInstitutionLogo] = useState<File | null>(null);

    useEffect(() => {
        setInstitution(education.institution);
        setDegree(education.degree);
        setFieldOfStudy(education.field_of_study ?? "");
        setStartYear(education.start_year ?? "");
        setEndYear(education.end_year ?? "");
        setIsCurrent(education.is_current);
        setDescription(education.description ?? "");
    }, [education]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!education.id) return;

        await updateEducation(education.id, {
            institution: institution || null,
            degree: degree || null,
            field_of_study: fieldOfStudy || null,
            start_year: startYear || null,
            end_year: isCurrent ? null : endYear || null,
            is_current: isCurrent,
            description: description || null,
            institution_logo: institutionLogo,
        });
        onOpenChange(false);
    };

    const resetForm = () => {
        setInstitution(education.institution);
        setDegree(education.degree);
        setFieldOfStudy(education.field_of_study ?? "");
        setStartYear(education.start_year ?? "");
        setEndYear(education.end_year ?? "");
        setIsCurrent(education.is_current);
        setDescription(education.description ?? "");
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
                        Edit Education
                    </DialogTitle>
                    <DialogDescription>
                        Update your education details
                    </DialogDescription>
                </DialogHeader>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <Textinput
                    label="Institution"
                    value={institution}
                    onChange={(e) => setInstitution(e)}
                    required
                />

                <Textinput
                    label="Degree"
                    value={degree}
                    onChange={(e) => setDegree(e)}
                    required
                />

                <Textinput
                    label="Field of Study"
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
                    value={description}
                    onChange={(e) => setDescription(e)}
                />

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
                        onClick={() => {
                            resetForm();
                            onOpenChange(false);
                        }}
                        text="Cancel"
                    />
                    <Button
                        icon={<Save size={16} />}
                        type="submit"
                        disabled={isUpdating || !institution || !degree}
                        loading={isUpdating}
                        text="Save Changes"
                    />
                </div>
            </form>
        </Modal>
    );
}