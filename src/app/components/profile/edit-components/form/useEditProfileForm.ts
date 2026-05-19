// src/app/components/profile/edit-components/form/useEditProfileForm.ts
import type { FieldStatus } from "./types";

import { useState, useCallback } from "react";
import type {
  UpdateProfilePayload,
  UpdateUserInfoPayload,
  UserProfileRequest,
  UserUpdateRequest,
} from "@/lib/stores/user/useUserSettings";

type FieldType = "personal" | "profile";

interface UseEditProfileFormProps {
  profile: UserProfileRequest | null;
  userInfo: UserUpdateRequest | null;
  onSaveProfile: (payload: UpdateProfilePayload) => Promise<void>;
  onSaveUserInfo: (payload: UpdateUserInfoPayload) => Promise<void>;
}

export const useEditProfileForm = ({
  profile,
  userInfo,
  onSaveProfile,
  onSaveUserInfo,
}: UseEditProfileFormProps) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [globalSaveStatus, setGlobalSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());
  const [fieldStatuses, setFieldStatuses] = useState<
    Record<string, FieldStatus>
  >({});

  const [personalForm, setPersonalForm] = useState({
    firstname: userInfo?.firstname ?? "",
    middlename: userInfo?.middlename ?? "",
    lastname: userInfo?.lastname ?? "",
    username: userInfo?.username ?? "",
    email: userInfo?.email ?? "",
    phone_number: userInfo?.phone_number ?? "",
  });

  const [profileForm, setProfileForm] = useState({
    profession: profile?.profession ?? "",
    job_title: profile?.job_title ?? "",
    years_of_experience: profile?.years_of_experience ?? "",
    location: profile?.location ?? "",
    bio: profile?.bio ?? "",
    website_url: profile?.website_url ?? "",
    github_username: profile?.github_username ?? "",
    availability: profile?.availability ?? "",
    open_to_work: profile?.open_to_work ?? false,
  });

  const markFieldModified = useCallback((field: string) => {
    setModifiedFields((prev) => new Set(prev).add(field));
    setFieldStatuses((prev) => ({ ...prev, [field]: "modified" }));
  }, []);

  const updatePersonal = useCallback(
    (field: string, value: string) => {
      setPersonalForm((p) => ({ ...p, [field]: value }));
      markFieldModified(`personal.${field}`);
    },
    [markFieldModified],
  );

  const updateProfile = useCallback(
    (field: string, value: string | boolean | number) => {
      setProfileForm((p) => ({ ...p, [field]: value }));
      markFieldModified(`profile.${field}`);
    },
    [markFieldModified],
  );

  const handleSaveAvatar = useCallback(async () => {
    if (!avatarFile) return;

    try {
      setFieldStatuses((prev) => ({
        ...prev,
        "personal.profile_picture": "saving",
      }));
      const payload: UpdateUserInfoPayload = { profile_picture: avatarFile };
      await onSaveUserInfo(payload);

      setFieldStatuses((prev) => ({
        ...prev,
        "personal.profile_picture": "saved",
      }));
      setModifiedFields((prev) => {
        const next = new Set(prev);
        next.delete("avatar");
        return next;
      });
      setAvatarFile(null);

      setTimeout(() => {
        setFieldStatuses((prev) => ({
          ...prev,
          "personal.profile_picture": "unchanged",
        }));
      }, 2000);
    } catch {
      setFieldStatuses((prev) => ({
        ...prev,
        "personal.profile_picture": "error",
      }));
      setTimeout(() => {
        setFieldStatuses((prev) => ({
          ...prev,
          "personal.profile_picture": "modified",
        }));
      }, 3000);
    }
  }, [avatarFile, onSaveUserInfo]);

  const handleSaveField = useCallback(
    async (
      fieldType: FieldType,
      field: string,
      overrideValue?: string | boolean | number,
    ) => {
      const fieldKey = `${fieldType}.${field}`;
      try {
        setFieldStatuses((prev) => ({ ...prev, [fieldKey]: "saving" }));

        if (fieldType === "personal") {
          await onSaveUserInfo({
            [field]: personalForm[field as keyof typeof personalForm],
          } as UpdateUserInfoPayload);
        } else {
          const formValue = profileForm[field as keyof typeof profileForm];
          const resolved =
            overrideValue !== undefined ? overrideValue : formValue;
          const value =
            field === "years_of_experience" ? Number(resolved) : resolved;
          await onSaveProfile({ [field]: value } as UpdateProfilePayload);
        }

        setFieldStatuses((prev) => ({ ...prev, [fieldKey]: "saved" }));
        setModifiedFields((prev) => {
          const next = new Set(prev);
          next.delete(fieldKey);
          return next;
        });

        setTimeout(() => {
          setFieldStatuses((prev) => ({ ...prev, [fieldKey]: "unchanged" }));
        }, 2000);
      } catch {
        setFieldStatuses((prev) => ({ ...prev, [fieldKey]: "error" }));
        setTimeout(() => {
          setFieldStatuses((prev) => ({ ...prev, [fieldKey]: "modified" }));
        }, 3000);
      }
    },
    [personalForm, profileForm, onSaveProfile, onSaveUserInfo],
  );

  const handleSaveAll = useCallback(async () => {
    setGlobalSaveStatus("saving");
    try {
      const personalData: Partial<UpdateUserInfoPayload> = {};
      const profileData: Partial<UpdateProfilePayload> = {};

      modifiedFields.forEach((fieldKey) => {
        const [type, field] = fieldKey.split(".") as [FieldType, string];
        if (type === "personal") {
          personalData[field as keyof UpdateUserInfoPayload] = personalForm[
            field as keyof typeof personalForm
          ] as any;
        } else {
          const value =
            field === "years_of_experience"
              ? Number(profileForm[field as keyof typeof profileForm])
              : profileForm[field as keyof typeof profileForm];
          profileData[field as keyof UpdateProfilePayload] = value as any;
        }
      });

      if (Object.keys(personalData).length > 0 || avatarFile) {
        const payload: UpdateUserInfoPayload = {
          ...personalData,
          ...(avatarFile ? { profile_picture: avatarFile } : {}),
        } as UpdateUserInfoPayload;
        await onSaveUserInfo(payload);
      }

      if (Object.keys(profileData).length > 0) {
        await onSaveProfile(profileData as UpdateProfilePayload);
      }

      setGlobalSaveStatus("saved");
      setModifiedFields(new Set());
      setFieldStatuses({});

      setTimeout(() => setGlobalSaveStatus("idle"), 2500);
    } catch {
      setGlobalSaveStatus("error");
      setTimeout(() => setGlobalSaveStatus("idle"), 3000);
    }
  }, [
    modifiedFields,
    personalForm,
    profileForm,
    avatarFile,
    onSaveProfile,
    onSaveUserInfo,
  ]);

  return {
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
  };
};
