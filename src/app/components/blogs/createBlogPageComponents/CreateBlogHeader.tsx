"use client";

import { ArrowLeft, Plus } from "lucide-react";
import Button from "../../buttons/Buttons";

interface CreateBlogHeaderProps {
    onBack: () => void;
    onSubmit: () => void;
    isValid: boolean;
    isLoading: boolean;
}

export function CreateBlogHeader({
    onBack,
    onSubmit,
    isValid,
    isLoading,
}: CreateBlogHeaderProps) {
    return (
        <div className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--foreground)]/5">
            <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
                <div>
                    <Button
                        onClick={onBack}
                        className="flex items-center gap-2 text-sm text-[var(--foreground)]/60 hover:text-[var(--accent)] transition-colors"
                        icon={<ArrowLeft className="w-4 h-4" />}
                        text="Back"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <Button
                        onClick={onSubmit}
                        disabled={!isValid || isLoading}
                        loading={isLoading}
                        icon={<Plus className="w-4 h-4" />}
                        text="Create Post"
                    />
                </div>
            </div>
        </div>
    );
}