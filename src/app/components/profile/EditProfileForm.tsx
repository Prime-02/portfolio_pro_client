// src/app/components/profile/EditProfileForm.tsx

"use client";
import type {
    UpdateProfilePayload,
    UpdateUserInfoPayload,
    UserProfileRequest,
    UserSettings,
    UserUpdateRequest,
} from "@/lib/stores/user/useUserSettings";
import { professionalInformation } from "@/lib/utilities/indices/MultiStepWriteUp";
import { PersonalInfoSection } from "./edit-components/form/PersonalInfoSection";
import { ProfessionalIdentitySection } from "./edit-components/form/ProfessionalIdentitySection";
import { BioLinksSection } from "./edit-components/form/BioLinksSection";
import { GlobalActionBar } from "./edit-components/form/GlobalActionBar";
import { useEditProfileForm } from "./edit-components/form/useEditProfileForm";

interface EditProfileFormProps {
    profile: UserProfileRequest | null;
    userInfo: UserUpdateRequest | null;
    settings: UserSettings | null;
    onSaveProfile: (payload: UpdateProfilePayload) => Promise<void>;
    onSaveUserInfo: (payload: UpdateUserInfoPayload) => Promise<void>;
    onSaveSettings: (payload: Partial<UserSettings>) => Promise<void>;
    onCancel: () => void;
    isSaving?: boolean;
}

export const EditProfileForm = ({
    profile,
    userInfo,
    onSaveProfile,
    onSaveUserInfo,
    onCancel,
    isSaving = false,
}: EditProfileFormProps) => {
    const {
        avatarFile,
        setAvatarFile,
        globalSaveStatus,
        modifiedFields,
        fieldStatuses,
        personalForm,
        profileForm,
        markFieldModified,
        updatePersonal,
        updateProfile,
        handleSaveAvatar,
        handleSaveField,
        handleSaveAll,
    } = useEditProfileForm({
        profile,
        userInfo,
        onSaveProfile,
        onSaveUserInfo,
    });

    return (
        <div className="space-y-8">
            <PersonalInfoSection
                userInfo={userInfo}
                personalForm={personalForm}
                avatarFile={avatarFile}
                modifiedFields={modifiedFields}
                fieldStatuses={fieldStatuses}
                onAvatarFileSelect={(file) => {
                    setAvatarFile(file);
                    markFieldModified("avatar");
                }}
                onSaveAvatar={handleSaveAvatar}
                onUpdatePersonal={updatePersonal}
                onSaveField={handleSaveField}
            />

            <ProfessionalIdentitySection
                profileForm={profileForm}
                fieldStatuses={fieldStatuses}
                modifiedFields={modifiedFields}
                professionalInformation={professionalInformation}
                onUpdateProfile={updateProfile}
                onSaveField={handleSaveField}
            />

            <BioLinksSection
                profileForm={profileForm}
                fieldStatuses={fieldStatuses}
                modifiedFields={modifiedFields}
                onUpdateProfile={updateProfile}
                onSaveField={handleSaveField}
            />

            <GlobalActionBar
                modifiedFieldsCount={modifiedFields.size}
                globalSaveStatus={globalSaveStatus}
                isSaving={isSaving}
                onSaveAll={handleSaveAll}
                onCancel={onCancel}
            />
        </div>
    );
};