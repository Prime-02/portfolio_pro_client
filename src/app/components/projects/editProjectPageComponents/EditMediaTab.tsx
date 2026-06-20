"use client";

import { useState } from "react";
import { useProjectStore } from "@/lib/stores/projects/useProjectsStore";
import { FileInput } from "../../inputs/FileInput";
import Button from "../../buttons/Buttons";
import { Trash } from "lucide-react";
import Modal from "../../containers/modals/Modal";

export type MediaSlotKey = "hero_media" | "media_1" | "media_2" | "media_3";

interface MediaSlot {
    key: MediaSlotKey;
    label: string;
    value: File | string | null;
    onChange: (file: File | null) => void;
}

interface EditMediaTabProps {
    slots: MediaSlot[];
    projectId: string;
}

export function EditMediaTab({ slots, projectId }: EditMediaTabProps) {
    const { deleteProjectMedia } = useProjectStore();
    const [deletingSlot, setDeletingSlot] = useState<MediaSlotKey | null>(null);
    const [pendingSlot, setPendingSlot] = useState<MediaSlot | null>(null);

    const requestDelete = (slot: MediaSlot) => {
        if (deletingSlot) return; // guard against overlapping deletes
        setPendingSlot(slot);
    };

    const confirmDelete = async () => {
        if (!pendingSlot) return;
        const { key, onChange } = pendingSlot;

        setPendingSlot(null);
        setDeletingSlot(key);
        try {
            const success = await deleteProjectMedia(projectId, key);
            if (success) {
                // Clear the local form value so the slot reflects empty state
                onChange(null);
            }
        } finally {
            setDeletingSlot(null);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {slots.map((slot) => {
                const { key, label, value, onChange } = slot;
                const isEmpty = !value;
                const isDeleting = deletingSlot === key;

                return (
                    <div key={key} className="space-y-2">
                        <h3 className="text-sm font-medium">{label}</h3>
                        <FileInput value={value} onChange={onChange} />
                        <Button
                            text="Delete"
                            icon2={<Trash size={16} />}
                            onClick={() => requestDelete(slot)}
                            loading={isDeleting}
                            disabled={isEmpty || isDeleting}
                            variant="danger"
                        />
                    </div>
                );
            })}

            <Modal
                isOpen={pendingSlot !== null}
                onClose={() => setPendingSlot(null)}
                title={"Delete media"}
                size="sm"
                centered
            >
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Delete {pendingSlot?.label ?? "this media"}? This can&apos;t be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button text="Cancel" onClick={() => setPendingSlot(null)} />
                        <Button variant="danger" text="Delete" onClick={confirmDelete} />
                    </div>
                </div>
            </Modal>
        </div>
    );
}