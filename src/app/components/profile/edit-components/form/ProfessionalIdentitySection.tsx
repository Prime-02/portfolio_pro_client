// src/app/components/profile/edit-components/form/ProfessionalIdentitySection.tsx

import React from "react";
import { SectionHeader } from "../../SectionHeader";
import { Textinput } from "../../../inputs/Textinput";
import Switch from "../../../inputs/Switch";
import { FieldWrapper } from "./FieldWrapper";
import { SaveStatusIndicator } from "../SaveStatusIndicator";
import type { ProfileForm, FieldStatus } from "./types";



interface ProfessionalIdentitySectionProps {
    profileForm: ProfileForm;
    fieldStatuses: Record<string, FieldStatus>;
    modifiedFields: Set<string>;
    professionalInformation: any;
    onUpdateProfile: (field: string, value: string | boolean | number) => void;
    onSaveField: (fieldType: "personal" | "profile", field: string, overrideValue?: string | boolean | number) => Promise<void>;
}

export const ProfessionalIdentitySection = ({
    profileForm,
    fieldStatuses,
    professionalInformation,
    onUpdateProfile,
    onSaveField,
}: ProfessionalIdentitySectionProps) => {
    return (
        <section className="card rounded-2xl p-6 sm:p-8 space-y-6">
            <SectionHeader
                title="Professional Identity"
                subtitle="How you appear in the professional community"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    { field: "profession", label: "Profession *", placeholder: "Software Engineer" },
                    { field: "job_title", label: "Job Title", placeholder: "Senior Developer" },
                    { field: "years_of_experience", label: "Years of Experience", placeholder: "5", type: "number" },
                    { field: "location", label: "Location", placeholder: "San Francisco, CA" },
                ].map(({ field, label, placeholder, type }) => (
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
                            type={type}
                        />
                    </FieldWrapper>
                ))}

                <FieldWrapper
                    status={fieldStatuses["profile.availability"]}
                    onSave={() => onSaveField("profile", "availability")}
                >
                    <Textinput
                        value={profileForm.availability}
                        onChange={(e) => onUpdateProfile("availability", e)}
                        placeholder="Availability"
                        desc={professionalInformation.fields[7].description}
                        type={professionalInformation.fields[7].type}
                        maxLength={professionalInformation.fields[7].constraints.max_length}
                        options={professionalInformation.fields[7].constraints.enum}
                    />
                </FieldWrapper>

                <div className="flex items-center justify-between p-4 rounded-xl border border-(--accent)/20 bg-(--accent)/5">
                    <div>
                        <p className="text-sm font-league-500 text-(--foreground)">Open to Work</p>
                        <p className="text-xs text-(--foreground)/50 mt-0.5">{`Show recruiters you're available`}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <SaveStatusIndicator status={fieldStatuses["profile.open_to_work"]} />
                        <Switch
                            isSwitched={profileForm.open_to_work}
                            onSwitch={() => {
                                const newValue = !profileForm.open_to_work;
                                onUpdateProfile("open_to_work", newValue);
                                onSaveField("profile", "open_to_work", newValue); // pass it directly
                            }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};