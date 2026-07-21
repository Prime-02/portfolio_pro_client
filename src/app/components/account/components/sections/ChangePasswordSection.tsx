// components/sections/ChangePasswordSection.tsx
"use client";

import { useState, useCallback } from "react";
import { useUserAccountStore } from "@/lib/stores/user/useUserAccountStore";
import { ASCard as Card } from "../ui/Card";
import { ASSectionTitle as SectionTitle } from "../ui/SectionTitle";
import { ASSectionDesc as SectionDesc } from "../ui/SectionDesc";
import { toast } from "@/src/context/Toastify";
import Button from "../../../buttons/Buttons";
import { Textinput } from "../../../inputs/Textinput";

export function ChangePasswordSection() {
    const { changePassword, isChangingPassword } = useUserAccountStore();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const passwordMismatch =
        confirmPassword.length > 0 && newPassword !== confirmPassword;

    const canChangePassword =
        currentPassword.length > 0 &&
        newPassword.length >= 8 &&
        confirmPassword.length >= 8 &&
        !passwordMismatch;

    const handleChangePassword = useCallback(async () => {
        if (newPassword !== confirmPassword) {
            return;
        }

        const success = await changePassword({
            current_password: currentPassword,
            new_password: newPassword,
        });

        if (success) {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            toast.success("Password updated successfully");
        }
    }, [changePassword, currentPassword, newPassword, confirmPassword]);

    return (
        <Card className="mb-6">
            <SectionTitle>Change Password</SectionTitle>
            <SectionDesc>
                Update your password to keep your account secure.
            </SectionDesc>

            <div className="mt-5 space-y-4">
                <Textinput
                    label="Current Password"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    type="password"
                    placeholder="Enter current password"
                />
                <Textinput
                    label="New Password"
                    value={newPassword}
                    onChange={setNewPassword}
                    type="password"
                    placeholder="Minimum 8 characters"
                />
                <Textinput
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    type="password"
                    placeholder="Re-enter new password"
                />

                {passwordMismatch && (
                    <p className="text-sm text-red-500">Passwords do not match</p>
                )}

                <div className="flex justify-end">
                    <Button
                        onClick={handleChangePassword}
                        loading={isChangingPassword}
                        disabled={!canChangePassword}
                        text="Update Password"
                    />
                </div>
            </div>
        </Card>
    );
}