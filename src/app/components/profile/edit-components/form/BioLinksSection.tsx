// src/app/components/profile/edit-components/form/BioLinksSection.tsx

import React from "react";
import { SectionHeader } from "../../SectionHeader";
import MarkdownEditor from "../../../markdown/MarkdownEditor";
import { Textinput } from "../../../inputs/Textinput";
import { FieldWrapper } from "./FieldWrapper";
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
                    title="Bio & Links"
                    subtitle="Tell your story and share your presence"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                    { field: "website_url", label: "Website", placeholder: "https://yoursite.com", type: "url" },
                    { field: "github_username", label: "GitHub Username", placeholder: "octocat", prefix: "github.com/" },
                ].map(({ field, label, placeholder, type, prefix }) => (
                    <FieldWrapper
                        key={field}
                        status={fieldStatuses[`profile.${field}`]}
                        onSave={() => onSaveField("profile", field)}
                    >
                        <Textinput
                            label={label}
                            value={String(profileForm[field as keyof typeof profileForm])}
                            onChange={(v) => onUpdateProfile(field, v)}
                            placeholder={placeholder}
                            type={type as any}
                            prefix={prefix}
                        />
                    </FieldWrapper>
                ))}
            </div>
        </section>
    );
};