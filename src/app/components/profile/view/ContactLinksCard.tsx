// src/app/profile/view/ContactLinksCard.tsx

import { SectionHeader } from "@/src/app/components/profile/SectionHeader";
import { InfoField } from "@/src/app/components/profile/InfoField";
import type {
    UserProfileRequest,
    UserResponse,
    UserUpdateRequest,
} from "@/lib/stores/user/useUserSettings";

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

    const fields = [
        { label: "Email", value: (userInfo as any)?.email, icon: "mail" },
        { label: "Phone", value: (userInfo as any)?.phone_number, icon: "phone" },
        { label: "Website", value: profile?.website_url, isLink: true, icon: "globe" },
        {
            label: "GitHub",
            value: profile?.github_username,
            isLink: true,
            linkUrl: `https://github.com/${profile?.github_username}`,
            icon: "github"
        },
    ].filter(field => field.value);

    return (
        <div className="card rounded-2xl p-6 sm:p-8 space-y-4">
            <SectionHeader
                title="Contact & Links"
                subtitle="How to reach and connect"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map(field => (
                    <InfoField
                        key={field.label}
                        label={field.label}
                        value={field.value ?? null}
                        isLink={field.isLink}
                        linkUrl={field.linkUrl}
                    />
                ))}
            </div>
        </div>
    );
};