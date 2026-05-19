// src/app/components/profile/edit-components/ProfileTab.tsx

import { SectionHeader } from "../SectionHeader";
import { Textinput } from "../../inputs/Textinput";
import MarkdownEditor from "../../markdown/MarkdownEditor";
import { professionalInformation } from "@/lib/utilities/indices/MultiStepWriteUp";

interface ProfileForm {
    bio: string;
    profession: string;
    job_title: string;
    years_of_experience: string | number;
    website_url: string;
    location: string;
    github_username: string;
    availability: string;
    open_to_work: boolean;
}

interface ProfileTabProps {
    form: ProfileForm;
    onUpdate: (field: string, value: string | boolean | number) => void;
}

export const ProfileTab = ({ form, onUpdate }: ProfileTabProps) => {
    return (
        <div className="card rounded-2xl p-6 sm:p-8 space-y-6">
            <SectionHeader
                title="Profile Details"
                subtitle="Public-facing professional information"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Textinput
                    label="Profession"
                    value={form.profession}
                    onChange={(v) => onUpdate("profession", v)}
                    placeholder="Software Engineer"
                />
                <Textinput
                    label="Job Title"
                    value={form.job_title}
                    onChange={(v) => onUpdate("job_title", v)}
                    placeholder="Senior Developer"
                />
                <Textinput
                    label="Years of Experience"
                    value={String(form.years_of_experience)}
                    onChange={(v) => onUpdate("years_of_experience", v)}
                    placeholder="5"
                    type="number"
                />
                <Textinput
                    label="Location"
                    value={form.location}
                    onChange={(v) => onUpdate("location", v)}
                    placeholder="San Francisco, CA"
                />
                <Textinput
                    label="Website URL"
                    value={form.website_url}
                    onChange={(v) => onUpdate("website_url", v)}
                    placeholder="https://yoursite.com"
                    type="url"
                    className="sm:col-span-2"
                />
                <Textinput
                    label="GitHub Username"
                    value={form.github_username}
                    onChange={(v) => onUpdate("github_username", v)}
                    placeholder="octocat"
                    prefix="github.com/"
                />
                <Textinput
                    label="Availability"
                    value={form.availability}
                    onChange={(e) => onUpdate("availability", e)}
                    placeholder="Availability"
                    desc={professionalInformation.fields[7].description}
                    type={professionalInformation.fields[7].type}
                    maxLength={professionalInformation.fields[7].constraints.max_length}
                    options={professionalInformation.fields[7].constraints.enum}
                />

                {/* Open to Work Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-(--accent)/20 bg-(--accent)/5">
                    <div>
                        <p className="text-sm font-league-500 text-(--foreground)">Open to Work</p>
                        <p className="text-xs text-(--foreground)/50 mt-0.5">{`Show recruiters you're available`}</p>
                    </div>
                    <button
                    title="Open To Work"
                        onClick={() => onUpdate("open_to_work", !form.open_to_work)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none
                            ${form.open_to_work ? "bg-(--accent)" : "bg-(--foreground)/20"}`}
                    >
                        <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
                                ${form.open_to_work ? "translate-x-6" : "translate-x-0"}`}
                        />
                    </button>
                </div>
            </div>

            <MarkdownEditor
                label="Bio"
                value={form.bio}
                onChange={(v) => onUpdate("bio", v)}
                placeholder="Tell others about yourself..."
                minHeight="150px"
                showCopy={false}
                showDownload={false}
            />
        </div>
    );
};