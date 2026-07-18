// src/app/components/profile/edit-components/form/BioLinksSection.tsx

import React, { useState } from "react";
import { SectionHeader } from "../../SectionHeader";
import MarkdownEditor from "../../../markdown/MarkdownEditor";
import { InlineSaveButton } from "../InlineSaveButton";
import type { ProfileForm, FieldStatus } from "./types";
import AIAssistant from "../../../ai/AIAsistant";
import { getBioPromptOptions } from "./bioPromptOptions";
import { toast } from "../../../../../context/Toastify";

interface BioLinksSectionProps {
    profileForm: ProfileForm;
    fieldStatuses: Record<string, FieldStatus>;
    modifiedFields: Set<string>;
    onUpdateProfile: (field: string, value: string | boolean | number) => void;
    onSaveField: (fieldType: "personal" | "profile", field: string) => Promise<void>;
}

export const BioLinksSection = ({
    profileForm,
    fieldStatuses,
    modifiedFields,
    onUpdateProfile,
    onSaveField,
}: BioLinksSectionProps) => {
    // Keep a local state to ensure AI content is properly synced
    const [localBio, setLocalBio] = useState(profileForm.bio);

    // Sync local state when profileForm.bio changes externally
    React.useEffect(() => {
        setLocalBio(profileForm.bio);
    }, [profileForm.bio]);

    const handleBioChange = (value: string) => {
        setLocalBio(value);
        onUpdateProfile("bio", value);
    };

    const handleAIAssistantChange = (value: string) => {
        // console.log("AI generated bio:", value);
        handleBioChange(value);
    };

    const handleEmptyClick = () => {
        const missingFields = [];
        if (!profileForm.profession) missingFields.push("Profession");
        if (!profileForm.job_title) missingFields.push("Job Title");
        if (!profileForm.years_of_experience) missingFields.push("Years of Experience");
        if (!profileForm.availability) missingFields.push("Availability");

        if (missingFields.length > 0) {
            toast.warning(
                `Please complete your profile details to unlock AI bio suggestions. Missing: ${missingFields.join(", ")}`,
                {
                    title: "Incomplete Profile",
                }
            );
        } else {
            toast.info(
                "Start typing a bio to enable AI-powered suggestions and improvements",
                {
                    title: "Start Writing",
                }
            );
        }
    };

    return (
        <section className="card rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <SectionHeader
                    title="Bio"
                    subtitle="Tell your story"
                />
                {modifiedFields.has("profile.bio") && (
                    <InlineSaveButton
                        onSave={() => onSaveField("profile", "bio")}
                        status={fieldStatuses["profile.bio"]}
                    />
                )}
            </div>
            <div className={`relative ${modifiedFields.has("profile.bio") ? "ring-2 ring-(--accent)/20 rounded-lg" : ""}`}>
                <MarkdownEditor
                    value={localBio}
                    onChange={handleBioChange}
                    placeholder="Tell others about yourself, your experience, and what you're passionate about..."
                    minHeight="200px"
                    showCopy={false}
                    showDownload={false}
                />
                <div className="absolute bottom-0 right-0">
                    <AIAssistant
                        options={getBioPromptOptions({
                            currentText: localBio,
                            profession: profileForm.profession,
                            jobTitle: profileForm.job_title,
                            yearsOfExperience: profileForm.years_of_experience ? String(profileForm.years_of_experience) : undefined,
                            availability: profileForm.availability,
                            openToWork: profileForm.open_to_work
                        })}
                        onEmptyClick={handleEmptyClick}
                        onChange={(e) => {
                            handleAIAssistantChange(e);
                            toast.info("The AI has finished processing your request. Please review the output before saving.", {
                                title: "Prompt Ready",
                            })
                        }}
                    />
                </div>
            </div>
        </section>
    );
};