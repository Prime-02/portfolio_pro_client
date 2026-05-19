// src/app/profile/view/PreferencesCard.tsx

import { SectionHeader } from "@/src/app/components/profile/SectionHeader";
import { InfoField } from "@/src/app/components/profile/InfoField";
import type { UserSettings } from "@/lib/stores/user/useUserSettings";
import { ColorPalette } from "./ColorPalette";

interface PreferencesCardProps {
    settings: UserSettings | null;
}

export const PreferencesCard = ({ settings }: PreferencesCardProps) => {
    if (!settings) return null;

    return (
        <div className="card rounded-2xl p-6 sm:p-8 space-y-4">
            <SectionHeader
                title="Preferences"
                subtitle="Theme and display settings"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField label="Language" value={settings.language} />
                <InfoField label="Theme Mode" value={settings.theme} />
                <InfoField label="Loader Style" value={settings.loader} />
                <InfoField
                    label="Layout"
                    value={typeof settings.layout_style === "string" ? settings.layout_style : settings.layout_style ? "Custom" : "Default"}
                />
            </div>

            <ColorPalette settings={settings} />
        </div>
    );
};