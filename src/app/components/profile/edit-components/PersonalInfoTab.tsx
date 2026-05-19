// src/app/components/profile/edit-components/PersonalInfoTab.tsx

import { SectionHeader } from "../SectionHeader";
import { AvatarUpload } from "../AvatarUpload";
import { Textinput } from "../../inputs/Textinput";

interface PersonalInfoForm {
    firstname: string;
    middlename: string;
    lastname: string;
    username: string;
    email: string;
    phone_number: string;
}

interface PersonalInfoTabProps {
    form: PersonalInfoForm;
    onUpdate: (field: string, value: string) => void;
    avatarFile: File | null;
    onAvatarChange: (file: File | null) => void;
    currentAvatar?: string | null;
}

export const PersonalInfoTab = ({
    form,
    onUpdate,
    onAvatarChange,
    currentAvatar,
}: PersonalInfoTabProps) => {
    return (
        <div className="card rounded-2xl p-6 sm:p-8 space-y-6">
            <SectionHeader
                title="Personal Information"
                subtitle="Your account identity and contact details"
            />

            <div className="flex flex-col items-center mb-6">
                <AvatarUpload
                    currentImage={currentAvatar}
                    onFileSelect={onAvatarChange}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Textinput
                    label="First Name"
                    value={form.firstname}
                    onChange={(v) => onUpdate("firstname", v)}
                    placeholder="John"
                />
                <Textinput
                    label="Middle Name"
                    value={form.middlename}
                    onChange={(v) => onUpdate("middlename", v)}
                    placeholder="(optional)"
                />
                <Textinput
                    label="Last Name"
                    value={form.lastname}
                    onChange={(v) => onUpdate("lastname", v)}
                    placeholder="Doe"
                />
                <Textinput
                    label="Username"
                    value={form.username}
                    onChange={(v) => onUpdate("username", v)}
                    placeholder="johndoe"
                    prefix="@"
                />
                <Textinput
                    label="Email"
                    value={form.email}
                    onChange={(v) => onUpdate("email", v)}
                    placeholder="john@example.com"
                    type="email"
                    className="sm:col-span-2"
                />
                <Textinput
                    label="Phone Number"
                    value={form.phone_number}
                    onChange={(v) => onUpdate("phone_number", v)}
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                    className="sm:col-span-2"
                />
            </div>
        </div>
    );
};