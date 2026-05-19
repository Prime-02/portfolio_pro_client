"use client";

import { useState, useMemo, useEffect } from "react";
import { useSocialLinks } from "@/lib/stores/social_links/useSocialLinks";
import { DialogHeader, DialogTitle, DialogDescription } from "../ui/Dialog";
import { Textinput } from "../inputs/Textinput";
import Button from "../buttons/Buttons";
import Modal from "../containers/modals/Modal";
import { socialMediaPlatforms } from "@/lib/utilities/indices/DropDownItems";
import { Plus, Search, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

interface AddSocialLinkDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const INITIAL_VISIBLE_COUNT = 8;

const PLATFORM_DOMAIN_EXCEPTIONS: Record<string, string> = {
    "x.com": "Twitter/X",
    "twitter.com": "Twitter/X",
    "youtu.be": "YouTube",
    "wa.me": "WhatsApp",
    "t.me": "Telegram",
    "telegram.me": "Telegram",
    "discord.gg": "Discord",
    "vk.com": "VKontakte",
    "last.fm": "Last.fm",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+\d\s\-().]{7,}$/;

function detectPlatformFromUrl(url: string, platforms: typeof socialMediaPlatforms): string | null {
    if (!url.trim()) return null;

    // Check for phone numbers first
    if (PHONE_REGEX.test(url.trim())) return "Phone";

    // Check for emails
    if (EMAIL_REGEX.test(url.trim())) return "Email";

    let hostname = "";
    try {
        hostname = new URL(url).hostname.toLowerCase().replace("www.", "");
    } catch {
        hostname = url.toLowerCase();
    }

    const exception = PLATFORM_DOMAIN_EXCEPTIONS[hostname];
    if (exception) return exception;

    return platforms.find((platform) => {
        // Skip non-URL platforms
        if (platform.code === "Phone" || platform.code === "Email") {
            return false;
        }

        // Normalize platform code for comparison
        const normalizedCode = platform.code
            .toLowerCase()
            .replace(/\/.*$/, "") // Remove everything after slash (e.g., "Twitter/X" -> "twitter")
            .replace(/\s+/g, "")   // Remove spaces
            .replace(/[.-]/g, ""); // Remove dots and hyphens

        // Check if the normalized code appears in the hostname
        return hostname.includes(normalizedCode);
    })?.code ?? null;
}

function deriveUrlType(value: string): string {
    if (!value.trim()) return "";
    if (EMAIL_REGEX.test(value.trim())) return "email";
    if (PHONE_REGEX.test(value.trim())) return "phone";
    return "link";
}

export function AddSocialLinkDialog({ open, onOpenChange }: AddSocialLinkDialogProps) {
    const { createSocialLink, isCreating } = useSocialLinks();
    const { getThemeVariant } = useUserSettings();
    const [selectedPlatform, setSelectedPlatform] = useState("");
    const [profileUrl, setProfileUrl] = useState("");
    const [headline, setHeadline] = useState("");
    const [urlType, setUrlType] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showAllPlatforms, setShowAllPlatforms] = useState(false);
    const [showManualPicker, setShowManualPicker] = useState(false);
    const [autoDetected, setAutoDetected] = useState<string | null>(null);

    useEffect(() => {
        // First determine the URL type
        const detectedUrlType = deriveUrlType(profileUrl);
        setUrlType(detectedUrlType);

        // Clear everything if input is empty
        if (!profileUrl.trim()) {
            setSelectedPlatform("");
            setAutoDetected(null);
            setShowManualPicker(false);
            return;
        }

        // Auto-detect platform for all types (phone, email, and URLs)
        const detected = detectPlatformFromUrl(profileUrl, socialMediaPlatforms);
        setAutoDetected(detected);

        if (detected) {
            setSelectedPlatform(detected);
            setShowManualPicker(false);
        }
    }, [profileUrl]);

    const detectedPlatformObj = useMemo(
        () => socialMediaPlatforms.find((p) => p.code === autoDetected),
        [autoDetected]
    );

    const filteredPlatforms = useMemo(() => {
        if (!searchQuery.trim()) return socialMediaPlatforms;
        const query = searchQuery.toLowerCase().trim();
        return socialMediaPlatforms.filter(
            (p) =>
                p.code.toLowerCase().includes(query) ||
                p.id.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const visiblePlatforms = useMemo(() => {
        if (showAllPlatforms) return filteredPlatforms;
        return filteredPlatforms.slice(0, INITIAL_VISIBLE_COUNT);
    }, [filteredPlatforms, showAllPlatforms]);

    const hasMorePlatforms = filteredPlatforms.length > INITIAL_VISIBLE_COUNT;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlatform || !profileUrl) return;

        await createSocialLink({
            platform_name: selectedPlatform,
            profile_url: profileUrl,
            profile_headline: headline || "",
            url_type: urlType,
        });

        resetForm();
        onOpenChange(false);
    };

    const resetForm = () => {
        setSelectedPlatform("");
        setProfileUrl("");
        setHeadline("");
        setUrlType("");
        setSearchQuery("");
        setShowAllPlatforms(false);
        setShowManualPicker(false);
        setAutoDetected(null);
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
                    <DialogTitle className="font-league-600 text-xl">
                        Add Social Link
                    </DialogTitle>
                    <DialogDescription>
                        Connect your social media profile
                    </DialogDescription>
                </DialogHeader>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">

                {/* Step 1: URL input */}
                <div>
                    <Textinput
                        type="text"
                        placeholder="https://... or email or phone"
                        value={profileUrl}
                        onChange={(e) => setProfileUrl(e)}
                        required
                        label="Profile URL or Contact Info"
                    />
                </div>

                {/* Step 2a: Auto-detected platform badge */}
                {profileUrl.trim() && autoDetected && detectedPlatformObj && !showManualPicker && (
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl 
                                    border border-[var(--foreground)]/10 bg-[var(--accent)]/5">
                        <div className="flex items-center gap-2.5">
                            <detectedPlatformObj.icon
                                className="w-5 h-5"
                                style={{ color: detectedPlatformObj.color }}
                            />
                            <div>
                                <p className="text-sm font-medium">{detectedPlatformObj.code}</p>
                                <p className="text-xs text-[var(--foreground)]/50">
                                    Detected from input · <span className="capitalize">{urlType}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <button
                                type="button"
                                onClick={() => setShowManualPicker(true)}
                                className="text-xs text-[var(--accent)] hover:underline"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2b: No match — prompt manual selection */}
                {profileUrl.trim() && !autoDetected && !showManualPicker && (
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl 
                                    border border-[var(--foreground)]/10 text-[var(--foreground)]/60">
                        <p className="text-sm">
                            {` Couldn't detect platform · `}
                            <span className="capitalize text-[var(--foreground)]/40">{urlType}</span>
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowManualPicker(true)}
                            className="text-xs text-[var(--accent)] hover:underline font-medium"
                        >
                            Select manually
                        </button>
                    </div>
                )}

                {/* Step 2c: Manual platform picker */}
                {showManualPicker && (
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Select Platform
                        </label>

                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/40" />
                            <input
                                type="text"
                                placeholder="Search platforms..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowAllPlatforms(false);
                                }}
                                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--foreground)]/10 
                                           bg-transparent focus:outline-none focus:border-[var(--accent)] 
                                           transition-colors placeholder:text-[var(--foreground)]/40"
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            {visiblePlatforms.map((platform) => {
                                const Icon = platform.icon;
                                return (
                                    <button
                                        key={platform.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedPlatform(platform.code);
                                            setAutoDetected(platform.code);
                                            setShowManualPicker(false);
                                        }}
                                        className={`p-3 rounded-xl border-2 transition-all duration-200 
                                                    flex flex-col items-center gap-1.5
                                                    ${selectedPlatform === platform.code
                                                ? "border-[var(--accent)] bg-[var(--accent)]/5"
                                                : "border-[var(--foreground)]/10 hover:border-[var(--foreground)]/30"
                                            }`}
                                        style={
                                            selectedPlatform === platform.code
                                                ? {
                                                    borderColor:
                                                        getThemeVariant() === "dark"
                                                            ? platform.darkColor
                                                            : platform.color,
                                                }
                                                : {}
                                        }
                                    >
                                        <Icon className="w-5 h-5" style={{ color: platform.color }} />
                                        <span className="text-xs">{platform.code}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {filteredPlatforms.length === 0 && (
                            <p className="text-center text-sm text-[var(--foreground)]/50 mt-3">
                                {`No platforms found for "${searchQuery}"`}
                            </p>
                        )}

                        {hasMorePlatforms && !searchQuery.trim() && (
                            <button
                                type="button"
                                onClick={() => setShowAllPlatforms(!showAllPlatforms)}
                                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 
                                           text-sm text-[var(--accent)] hover:text-[var(--accent)]/80 
                                           transition-colors font-medium"
                            >
                                {showAllPlatforms ? (
                                    <>Show Less <ChevronUp className="w-4 h-4" /></>
                                ) : (
                                    <>Show More ({socialMediaPlatforms.length - INITIAL_VISIBLE_COUNT} more) <ChevronDown className="w-4 h-4" /></>
                                )}
                            </button>
                        )}
                    </div>
                )}

                {/* Headline / Bio */}
                <div>
                    <Textinput
                        label="Bio or Headline (optional)"
                        placeholder="A short description..."
                        value={headline}
                        onChange={(e) => setHeadline(e)}
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => { resetForm(); onOpenChange(false); }}
                        text="Cancel"
                    />
                    <Button
                        type="submit"
                        disabled={!selectedPlatform || !profileUrl || isCreating}
                        loading={isCreating}
                        text="Add Link"
                        icon={<Plus size={16} />}
                    />
                </div>
            </form>
        </Modal>
    );
}