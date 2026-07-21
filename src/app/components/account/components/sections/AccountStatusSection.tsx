// components/sections/AccountStatusSection.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { useUserAccountStore } from "@/lib/stores/user/useUserAccountStore";
import { ASCard as Card } from "../ui/Card";
import { ASSectionTitle as SectionTitle } from "../ui/SectionTitle";
import { ASSectionDesc as SectionDesc } from "../ui/SectionDesc";
import { toast } from "@/src/context/Toastify";
import { ASConfirmModal as ConfirmModal } from "../ui/ConfirmModal";
import Button from "../../../buttons/Buttons";

export function AccountStatusSection() {
    const { userInfo, fetchUserInfo } = useUserSettings();
    const {
        deactivateAccount,
        reactivateAccount,
        isDeactivating,
        isReactivating,
    } = useUserAccountStore();

    const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
    const [reactivateModalOpen, setReactivateModalOpen] = useState(false);

    const isActive = userInfo?.is_active ?? true;

    const handleDeactivate = useCallback(async () => {
        const success = await deactivateAccount();
        if (success) {
            setDeactivateModalOpen(false);
            toast.success("Account deactivated successfully");
            fetchUserInfo();
        }
    }, [deactivateAccount, fetchUserInfo]);

    const handleReactivate = useCallback(async () => {
        const success = await reactivateAccount();
        if (success) {
            setReactivateModalOpen(false);
            toast.success("Account reactivated successfully");
            fetchUserInfo();
        }
    }, [reactivateAccount, fetchUserInfo]);

    return (
        <>
            <Card className="mb-6">
                <SectionTitle>Account Status</SectionTitle>
                <SectionDesc>
                    {isActive
                        ? "Your account is currently active. You can temporarily deactivate it."
                        : "Your account is currently inactive. Reactivate it to restore access."}
                </SectionDesc>

                <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-(--accent)" : "bg-amber-500"
                                }`}
                        />
                        <span className="text-sm font-medium text-(--foreground)">
                            {isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                    <Button
                        variant={isActive ? "ghost" : "primary"}
                        onClick={() =>
                            isActive
                                ? setDeactivateModalOpen(true)
                                : setReactivateModalOpen(true)
                        }
                        loading={isDeactivating || isReactivating}
                        text={isActive ? "Deactivate Account" : "Reactivate Account"}
                    />
                </div>
            </Card>

            <ConfirmModal
                open={deactivateModalOpen}
                onClose={() => setDeactivateModalOpen(false)}
                onConfirm={handleDeactivate}
                title="Deactivate Account"
                description="Your account will be temporarily deactivated. You can reactivate it at any time by signing in."
                confirmText="Deactivate"
                confirmVariant="primary"
                loading={isDeactivating}
            />

            <ConfirmModal
                open={reactivateModalOpen}
                onClose={() => setReactivateModalOpen(false)}
                onConfirm={handleReactivate}
                title="Reactivate Account"
                description="Your account will be restored to active status."
                confirmText="Reactivate"
                confirmVariant="primary"
                loading={isReactivating}
            />
        </>
    );
}