// components/social/SocialDialogs.tsx
import type { SocialLink } from "@/lib/stores/social_links/useSocialLinks";
import { AddSocialLinkDialog } from "./AddSocialLinkDialog";
import { EditSocialLinkDialog } from "./EditSocialLinkDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface SocialDialogsProps {
    addDialogOpen: boolean;
    onAddDialogChange: (open: boolean) => void;
    editLink: SocialLink | null;
    onEditLinkChange: (link: SocialLink | null) => void;
    deleteLink: SocialLink | null;
    onDeleteLinkChange: (link: SocialLink | null) => void;
    isDeleting: boolean;
    onDeleteConfirm: () => Promise<void>;
}

export function SocialDialogs({
    addDialogOpen,
    onAddDialogChange,
    editLink,
    onEditLinkChange,
    deleteLink,
    onDeleteLinkChange,
    isDeleting,
    onDeleteConfirm,
}: SocialDialogsProps) {
    return (
        <>
            <AddSocialLinkDialog
                open={addDialogOpen}
                onOpenChange={onAddDialogChange}
            />

            {editLink && (
                <EditSocialLinkDialog
                    link={editLink}
                    open={!!editLink}
                    onOpenChange={(open) => {
                        if (!open) onEditLinkChange(null);
                    }}
                />
            )}

            {deleteLink && (
                <DeleteConfirmDialog
                    platformName={deleteLink.platform_name}
                    profileUrl={deleteLink.profile_url}
                    open={!!deleteLink}
                    isLoading={isDeleting}
                    onConfirm={onDeleteConfirm}
                    onOpenChange={(open) => {
                        if (!open) onDeleteLinkChange(null);
                    }}
                />
            )}
        </>
    );
}