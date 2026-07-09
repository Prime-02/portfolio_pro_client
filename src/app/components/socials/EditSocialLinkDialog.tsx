// components/social/EditSocialLinkDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useSocialLinks } from "@/lib/stores/social_links/useSocialLinks";
import { Save } from "lucide-react";
import type { SocialLink } from "@/lib/stores/social_links/useSocialLinks";
import { Textinput } from "../inputs/Textinput";
import Button from "../buttons/Buttons";
import Modal from "../containers/modals/Modal";
import { DialogHeader, DialogTitle, DialogDescription } from "../ui/Dialog";
import { urlTypes } from "@/lib/utilities/indices/DropDownItems";
import { TextArea } from "../inputs/TextArea";
import AIAssistant from "../ai/AIAsistant";
import { getHeadlineOptions } from "./socialLinksPromptOptions";
import { toast } from "../toastify/Toastify";

interface EditSocialLinkDialogProps {
    link: SocialLink;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditSocialLinkDialog({ link, open, onOpenChange }: EditSocialLinkDialogProps) {
    const { updateSocialLink, isUpdating } = useSocialLinks();

    const [headline, setHeadline] = useState(link.profile_headline || "");
    const [profileUrl, setProfileUrl] = useState(link.profile_url);
    const [urlType, setUrlType] = useState(link.url_type || "");

    useEffect(() => {
        setProfileUrl(link.profile_url);
        setHeadline(link.profile_headline || "");
        setUrlType(link.url_type || "");
    }, [link]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateSocialLink(link.id, {
            profile_url: profileUrl || null,
            profile_headline: headline || null,
            url_type: urlType || null,
        });
        onOpenChange(false);
    };

    const resetForm = () => {
        setProfileUrl(link.profile_url);
        setHeadline(link.profile_headline || "");
        setUrlType(link.url_type || "");
    };

    return (
        <Modal
            isOpen={open}
            onClose={() => {
                resetForm();
                onOpenChange(false);
            }}
            title={
                <DialogHeader>
                    <DialogTitle className="font-league-600 text-xl capitalize">
                        Edit {link.platform_name}
                    </DialogTitle>
                    <DialogDescription>
                        Update your {link.platform_name} link details
                    </DialogDescription>
                </DialogHeader>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                    <Textinput
                        value={profileUrl}
                        onChange={(e) => setProfileUrl(e)}
                        required
                        label="Profile URL"
                    />
                </div>

                <div className="relative">
                    <TextArea
                        value={headline}
                        onChange={(e) => setHeadline(e)}
                        placeholder="Optional description..."
                        label="Bio / Headline"
                    />
                    <div className="absolute right-0  bottom-0">
                        <AIAssistant
                            options={getHeadlineOptions(headline, profileUrl)}
                            onChange={(e) => setHeadline(e)}
                            onEmptyClick={()=> {
                                toast.warning("Please enter a valid ")
                            }}
                        />
                    </div>
                </div>

                <div>
                    <Textinput
                        value={urlType}
                        type="dropdown"
                        options={urlTypes}
                        onChange={(e) => setUrlType(e)}
                        placeholder="e.g., handle, email"
                        label="Link Type"
                    />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            resetForm();
                            onOpenChange(false);
                        }}
                        text="Cancel"
                    />
                    <Button
                        icon={<Save size={16} />}
                        type="submit"
                        disabled={isUpdating || !profileUrl}
                        loading={isUpdating}
                        text="Save Changes"
                    />
                </div>
            </form>
        </Modal>
    );
}