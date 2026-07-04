// src/app/components/profile/edit-components/form/BioLinksSection.tsx

import React from "react";
import { SectionHeader } from "../../SectionHeader";
import MarkdownEditor from "../../../markdown/MarkdownEditor";
import { InlineSaveButton } from "../InlineSaveButton";
import type { ProfileForm, FieldStatus } from "./types";


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
            <div className={modifiedFields.has("profile.bio") ? "ring-2 ring-(--accent)/20 rounded-lg" : ""}>
                <MarkdownEditor
                    value={profileForm.bio}
                    onChange={(v) => onUpdateProfile("bio", v)}
                    placeholder="Tell others about yourself, your experience, and what you're passionate about..."
                    minHeight="200px"
                    showCopy={false}
                    showDownload={false}
                />
            </div>
        </section>
    );
};