// src/app/components/profile/edit-components/SaveStatusIndicator.tsx

import { Check, X } from "lucide-react";
import { LoaderComponent } from "../../loaders/Loader";

type FieldStatus = "unchanged" | "modified" | "saving" | "saved" | "error";

export const SaveStatusIndicator = ({ status }: { status?: FieldStatus }) => {
    if (!status || status === "unchanged") return null;


    switch (status) {
        case "modified":
            return (
                <div className="w-2 h-2 rounded-full bg-(--accent)"
                    title="Modified" />
            );
        case "saving":
            return (
                <LoaderComponent size={0.6} />
            );
        case "saved":
            return (
                <Check className="w-5 h-5 text-green-500" />
            );
        case "error":
            return (
                <X className="w-4 h-4 text-red-500" />
            );
    }
};