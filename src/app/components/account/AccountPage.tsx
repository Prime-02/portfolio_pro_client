// app/account-settings/page.tsx
"use client";

import { useEffect } from "react";
import { useUserAccountStore } from "@/lib/stores/user/useUserAccountStore";
import { PageHeader } from "../ui/PageHeader";
import { UserCog2Icon } from "lucide-react";
import { ProfileOverview } from "./components/sections/ProfileOverview";
import { ChangePasswordSection } from "./components/sections/ChangePasswordSection";
import { AccountStatusSection } from "./components/sections/AccountStatusSection";
import { DangerZoneSection } from "./components/sections/DangerZoneSection";
import { LinkedAccounts } from "./components/sections/LinkedAccounts";

export default function AccountSettingsPage() {
    const { clearErrors } = useUserAccountStore();

    useEffect(() => {
        return () => {
            clearErrors();
        };
    }, [clearErrors]);

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <PageHeader
                title="Account Settings"
                description="Manage your account details, security, and preferences"
                icon={<UserCog2Icon />}
            />

            <ProfileOverview />
            <LinkedAccounts />
            <ChangePasswordSection />
            <AccountStatusSection />
            <DangerZoneSection />
        </div>
    );
}