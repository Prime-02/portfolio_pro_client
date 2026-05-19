// src/app/components/profile/edit-components/form/PersonalInfoSection.tsx

import React from "react";
import { AvatarUpload } from "../../AvatarUpload";
import { Textinput } from "../../../inputs/Textinput";
import { UsernameField } from "../UsernameField";
import { FieldWrapper } from "./FieldWrapper";
import type { UserUpdateRequest } from "@/lib/stores/user/useUserSettings";
import type { PersonalForm, FieldStatus } from "./types";

interface PersonalInfoSectionProps {
    userInfo: UserUpdateRequest | null;
    personalForm: PersonalForm;
    avatarFile: File | null;
    modifiedFields: Set<string>;
    fieldStatuses: Record<string, FieldStatus>;
    onAvatarFileSelect: (file: File) => void;
    onSaveAvatar: () => Promise<void>;
    onUpdatePersonal: (field: string, value: string) => void;
    onSaveField: (fieldType: "personal" | "profile", field: string) => Promise<void>;
}

export const PersonalInfoSection = ({
    userInfo,
    personalForm,
    avatarFile,
    modifiedFields,
    fieldStatuses,
    onAvatarFileSelect,
    onSaveAvatar,
    onUpdatePersonal,
    onSaveField,
}: PersonalInfoSectionProps) => {
    return (
        <section className="card rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                <div className="flex-shrink-0 flex flex-col items-center">
                    <AvatarUpload
                        currentImage={userInfo?.profile_picture}
                        onFileSelect={onAvatarFileSelect}
                    />
                    {modifiedFields.has("avatar") && (
                        <button
                            onClick={onSaveAvatar}
                            className="mt-2 text-xs text-(--accent) hover:underline"
                        >
                            Save avatar
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldWrapper
                        status={fieldStatuses["personal.firstname"]}
                        onSave={() => onSaveField("personal", "firstname")}
                    >
                        <Textinput
                            label="First Name"
                            value={personalForm.firstname}
                            onChange={(v) => onUpdatePersonal("firstname", v)}
                            placeholder="John"
                            className={modifiedFields.has("personal.firstname") ? "border-(--accent)" : ""}
                        />
                    </FieldWrapper>

                    <FieldWrapper
                        status={fieldStatuses["personal.lastname"]}
                        onSave={() => onSaveField("personal", "lastname")}
                    >
                        <Textinput
                            label="Last Name"
                            value={personalForm.lastname}
                            onChange={(v) => onUpdatePersonal("lastname", v)}
                            placeholder="Doe"
                        />
                    </FieldWrapper>

                    <FieldWrapper
                        status={fieldStatuses["personal.middlename"]}
                        onSave={() => onSaveField("personal", "middlename")}
                    >
                        <Textinput
                            label="Middle Name"
                            value={personalForm.middlename}
                            onChange={(v) => onUpdatePersonal("middlename", v)}
                            placeholder="Middle"
                        />
                    </FieldWrapper>

                    <FieldWrapper
                        status={fieldStatuses["personal.username"]}
                        onSave={() => onSaveField("personal", "username")}
                    >
                        <UsernameField
                            label="Username"
                            value={personalForm.username}
                            onChange={(v) => onUpdatePersonal("username", v)}
                            placeholder="johndoe"
                            prefix="@"
                            currentUsername={userInfo?.username ?? ""}
                            onValidationChange={() => { }}
                        />
                    </FieldWrapper>
                </div>
            </div>
        </section>
    );
};