// src/app/profile/view/ContactLinksCard.tsx

import { SectionHeader } from "@/src/app/components/profile/SectionHeader";
import type {
    UserProfileRequest,
    UserUpdateRequest,
} from "@/lib/stores/user/useUserSettings";
import { UserResponse } from "@/lib/stores/user/useUserAccountStore";

interface ContactLinksCardProps {
    profile: UserProfileRequest | null;
    userInfo: UserResponse | UserUpdateRequest | null;
}

export const ContactLinksCard = ({
    profile,
    userInfo,
}: ContactLinksCardProps) => {
    const hasContactInfo = profile?.website_url ||
        profile?.github_username ||
        (userInfo as any)?.email ||
        (userInfo as any)?.phone_number;

    if (!hasContactInfo) return null;

  
    return (
        <div className="card rounded-2xl p-6 sm:p-8 space-y-4">
            <SectionHeader
                title="Contact & Links"
                subtitle="How to reach and connect"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               
            </div>
        </div>
    );
};