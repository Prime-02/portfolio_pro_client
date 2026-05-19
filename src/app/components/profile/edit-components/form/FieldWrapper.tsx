// src/app/components/profile/edit-components/form/FieldWrapper.tsx

import React from "react";
import { SaveStatusIndicator } from "../SaveStatusIndicator";
import { InlineSaveButton } from "../InlineSaveButton";
import type { FieldStatus } from "./types";

interface FieldWrapperProps {
    children: React.ReactNode;
    status?: FieldStatus;
    onSave: () => void;
}

export const FieldWrapper = ({ children, status, onSave }: FieldWrapperProps) => {
    const isModified = status === "modified";

    return (
        <div className="relative">
            {children}
            <div className="flex mt-2 items-center justify-end gap-1">
                <SaveStatusIndicator status={status} />
                {isModified && (
                    <InlineSaveButton onSave={onSave} status={status} />
                )}
            </div>
        </div>
    );
};