// components/experience/DeleteConfirmDialog.tsx
"use client";

import Button from "../buttons/Buttons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/Dialog";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteConfirmDialogProps {
    jobTitle: string;
    companyName: string;
    open: boolean;
    isLoading: boolean;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
}

export function DeleteConfirmDialog({
    jobTitle,
    companyName,
    open,
    isLoading,
    onConfirm,
    onOpenChange,
}: DeleteConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <div className="mx-auto mb-3 p-3 rounded-full bg-red-500/10 w-fit">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <DialogTitle className="font-league-600 text-xl text-center">
                        Remove Experience
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Are you sure you want to remove{" "}
                        <span className="font-semibold">{jobTitle}</span> at{" "}
                        <span className="font-semibold">{companyName}</span> from your profile?
                    </DialogDescription>
                </DialogHeader>

                <div className="p-3 rounded-xl bg-[var(--foreground)]/5 mt-4">
                    <p className="text-sm text-[var(--foreground)]/60 truncate text-center">
                        {jobTitle} · {companyName}
                    </p>
                </div>

                <p className="text-sm text-center text-[var(--foreground)]/50">
                    This action cannot be undone.
                </p>

                <div className="flex gap-3 justify-center mt-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} text="Cancel" />
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                        loading={isLoading}
                        className="bg-red-500 hover:bg-red-600 text-white"
                        icon={<Trash2 size={16} />}
                        text="Remove"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
