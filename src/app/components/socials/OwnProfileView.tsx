// components/social/OwnProfileView.tsx
import { Share2, Plus } from "lucide-react";
import Button from "../buttons/Buttons";
import { StatsBar } from "./StatsBar";
import { SocialLinksGrid } from "./SocialLinksGrid";
import { SocialDialogs } from "./SocialDialogs";
import { ErrorMessage } from "../ui/ErrorMessage";
import type { SocialLink } from "@/lib/stores/social_links/useSocialLinks";
import { PageHeader } from "../ui/PageHeader";
import { handleShareProfile } from "@/lib/utilities/syncFunctions/syncs";

interface OwnProfileViewProps {
    links: SocialLink[];
    isLoading: boolean;
    error: string | null;
    onClearError: () => void;
    addDialogOpen: boolean;
    onAddDialogChange: (open: boolean) => void;
    editLink: SocialLink | null;
    onEditLinkChange: (link: SocialLink | null) => void;
    deleteLink: SocialLink | null;
    onDeleteLinkChange: (link: SocialLink | null) => void;
    isDeleting: boolean;
    onDeleteConfirm: () => Promise<void>;
}

export function OwnProfileView({
    links,
    isLoading,
    error,
    onClearError,
    addDialogOpen,
    onAddDialogChange,
    editLink,
    onEditLinkChange,
    deleteLink,
    onDeleteLinkChange,
    isDeleting,
    onDeleteConfirm,
}: OwnProfileViewProps) {
    return (
        <div className="min-h-screen p-6 md:p-8 lg:p-10 max-w-6xl mx-auto">
            <PageHeader
                icon={<Share2 className="w-6 h-6 text-[var(--accent)]" />}
                title="My Links"
                description="Connect your social profiles and share them in one place"
                action={
                    <div className="flex items-center gap-x-2">
                        <Button
                            onClick={handleShareProfile}
                            className="self-start sm:self-auto"
                            text="Share Your Social Links"
                            icon={<Share2 className="w-4 h-4" />}
                            variant="outline"
                        />
                        <Button
                            onClick={() => onAddDialogChange(true)}
                            className="self-start sm:self-auto"
                            text="Add Link"
                            icon={<Plus className="w-4 h-4" />}
                        />
                    </div>
                }
            />

            {!isLoading && <StatsBar links={links} />}

            {error && <ErrorMessage message={error} onDismiss={onClearError} />}

            <SocialLinksGrid
                links={links}
                isLoading={isLoading}
                onEdit={onEditLinkChange}
                onDelete={onDeleteLinkChange}
                onAddClick={() => onAddDialogChange(true)}
                isPrivate
            />

            <SocialDialogs
                addDialogOpen={addDialogOpen}
                onAddDialogChange={onAddDialogChange}
                editLink={editLink}
                onEditLinkChange={onEditLinkChange}
                deleteLink={deleteLink}
                onDeleteLinkChange={onDeleteLinkChange}
                isDeleting={isDeleting}
                onDeleteConfirm={onDeleteConfirm}
            />
        </div>
    );
}