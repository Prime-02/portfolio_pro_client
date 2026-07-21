// components/sections/DangerZoneSection.tsx
"use client";

import { useState, useCallback } from "react";
import { useUserAccountStore } from "@/lib/stores/user/useUserAccountStore";
import { useAuthStore } from "@/lib/stores/user/useAuthStore";
import { ASCard as Card } from "../ui/Card";
import { ASSectionTitle as SectionTitle } from "../ui/SectionTitle";
import { ASSectionDesc as SectionDesc } from "../ui/SectionDesc";
import { toast } from "@/src/context/Toastify";
import Button from "../../../buttons/Buttons";
import { ASConfirmModal as ConfirmModal } from "../ui/ConfirmModal";

export function DangerZoneSection() {
    const { deleteAccount, isDeleting } = useUserAccountStore();
    const { logout } = useAuthStore();

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");

    const handleDelete = useCallback(async () => {
        const success = await deleteAccount({ password: deletePassword });
        if (success) {
            await logout(false);
            setDeleteModalOpen(false);
            setDeletePassword("");
            toast.success("Account deleted. Redirecting...");
            setTimeout(() => {
                window.location.href = "/";
            }, 2000);
        }
    }, [deleteAccount, deletePassword, logout]);

    return (
        <>
            <Card>
                <SectionTitle className="text-red-500">Danger Zone</SectionTitle>
                <SectionDesc>
                    Once you delete your account, there is no going back. This action is
                    permanent.
                </SectionDesc>

                <div className="mt-5">
                    <Button
                        variant="danger"
                        onClick={() => setDeleteModalOpen(true)}
                        className="w-full sm:w-auto"
                        text="Delete Account"
                    />
                </div>
            </Card>

            <ConfirmModal
                open={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setDeletePassword("");
                }}
                onConfirm={handleDelete}
                title="Delete Account"
                description="This will permanently delete your account and all associated data. Please enter your password to confirm."
                confirmText="Delete Permanently"
                confirmVariant="danger"
                loading={isDeleting}
                inputLabel="Password"
                inputValue={deletePassword}
                onInputChange={setDeletePassword}
            />
        </>
    );
}