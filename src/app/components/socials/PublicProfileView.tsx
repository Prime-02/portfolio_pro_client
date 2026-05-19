// components/social/PublicProfileView.tsx
import { Share2 } from "lucide-react";
import { PublicSocialProfile } from "./PublicSocialProfile";
import { ErrorMessage } from "../ui/ErrorMessage";
import { PageHeader } from "../ui/PageHeader";

interface PublicProfileViewProps {
    username: string;
    error: string | null;
    onClearError: () => void;
}

export function PublicProfileView({ username, error, onClearError }: PublicProfileViewProps) {
    return (
        <div className="min-h-screen p-6 md:p-8 lg:p-10 max-w-6xl mx-auto">
            <PageHeader
                icon={<Share2 className="w-6 h-6 text-[var(--accent)]" />}
                title={`${username}'s Links`}
            />
            {error && <ErrorMessage message={error} onDismiss={onClearError} />}
            <PublicSocialProfile username={username} />
        </div>
    );
}