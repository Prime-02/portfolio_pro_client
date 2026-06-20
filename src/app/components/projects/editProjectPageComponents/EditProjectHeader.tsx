"use client";

import { ArrowLeft, Save } from "lucide-react";
import Button from "../../buttons/Buttons";

interface EditProjectHeaderProps {
    onBack: () => void;
    onSubmit: () => void;
    isValid: boolean;
    isLoading: boolean;
}

export function EditProjectHeader({
    onBack,
    onSubmit,
    isValid,
    isLoading,
}: EditProjectHeaderProps) {
    return (
        <div className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--foreground)]/5">
            <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm text-[var(--foreground)]/60 hover:text-[var(--accent)] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <div>
                    <Button
                        onClick={onSubmit}
                        disabled={!isValid || isLoading}
                        loading={isLoading}
                        icon={<Save className="w-4 h-4" />}
                        text="Save Changes"
                    />
                </div>
            </div>
        </div>
    );
}