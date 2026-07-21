// components/sections/ProfileOverview.tsx
"use client";

import { useEffect } from "react";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { ASAvatar as Avatar } from "../ui/Avatar";
import { ASBadge as Badge } from "../ui/Badge";
import { ASCard as Card } from "../ui/Card";

export function ProfileOverview() {
    const { userInfo, fetchUserInfo } = useUserSettings();

    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    const fullName = [
        userInfo?.firstname,
        userInfo?.middlename,
        userInfo?.lastname,
    ]
        .filter(Boolean)
        .join(" ");

    const displayName = fullName || userInfo?.username || userInfo?.email || "";
    const isActive = userInfo?.is_active ?? true;

    return (
        <Card className="mb-6">
            <div className="flex items-start gap-4">
                <Avatar
                    src={userInfo?.profile_picture || null}
                    fallback={displayName}
                    size="lg"
                />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-league-600 text-lg text-(--foreground)">
                            {displayName}
                        </h3>
                        <Badge variant={isActive ? "success" : "warning"}>
                            {isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-(--foreground)/60">
                        {userInfo?.email}
                    </p>
                    {userInfo?.phone_number && (
                        <p className="text-sm text-(--foreground)/50">
                            {userInfo.phone_number}
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
}