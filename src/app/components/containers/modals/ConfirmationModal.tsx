"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import Modal from "./Modal";
import { useTheme } from "../../theme/ThemeContext";
import {
    AlertTriangle,
    AlertCircle,
    Info,
    CheckCircle2,
    LucideIcon,
} from "lucide-react";
import { getColorShade } from "@/lib/utilities/syncFunctions/syncs";
import { LoaderComponent } from "../../loaders/Loader";

type ConfirmationVariant = "danger" | "warning" | "info" | "success";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title?: string;
    message?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmationVariant;
    loading?: boolean;
    disableConfirm?: boolean;
    hideCancel?: boolean;
    zIndex?: number;
    closeOnBackdropClick?: boolean;
}

const variantConfig: Record<
    ConfirmationVariant,
    { icon: LucideIcon; color: string }
> = {
    danger: { icon: AlertTriangle, color: "#ef4444" },
    warning: { icon: AlertCircle, color: "#f59e0b" },
    info: { icon: Info, color: "#3b82f6" },
    success: { icon: CheckCircle2, color: "#22c55e" },
};

const buttonVariants: Variants = {
    rest: { scale: 1 },
    hover: {
        scale: 1.03,
        transition: { type: "spring", stiffness: 300, damping: 20 },
    },
    tap: { scale: 0.97 },
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    loading = false,
    disableConfirm = false,
    hideCancel = false,
    zIndex = 1200,
    closeOnBackdropClick = true,
}) => {
    const { theme } = useTheme();
    const [isConfirming, setIsConfirming] = useState(false);

    const isBusy = loading || isConfirming;
    const { icon: Icon, color } = variantConfig[variant];

    const handleConfirm = async () => {
        if (isBusy || disableConfirm) return;
        try {
            setIsConfirming(true);
            await onConfirm();
        } finally {
            setIsConfirming(false);
        }
    };

    const handleCancel = () => {
        if (isBusy) return;
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            size="sm"
            centered
            showCloseButton={!isBusy}
            showMinimizeButton={false}
            closeOnBackdropClick={closeOnBackdropClick && !isBusy}
            closeOnEscape={!isBusy}
            zIndex={zIndex}
        >
            <div className="flex flex-col items-center text-center px-4 py-4 gap-4">
                <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${color}1A` }}
                >
                    <Icon size={24} style={{ color }} />
                </div>

                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    {message && (
                        <p className="text-sm opacity-70 max-w-xs">{message}</p>
                    )}
                </div>

                <div className="flex items-center gap-3 w-full mt-2">
                    {!hideCancel && (
                        <motion.button
                            type="button"
                            onClick={handleCancel}
                            disabled={isBusy}
                            className="flex-1 py-2 rounded-xl border border-[var(--foreground)]/20 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: getColorShade(theme.background, 1) }}
                            variants={buttonVariants}
                            initial="rest"
                            whileHover={isBusy ? "rest" : "hover"}
                            whileTap={isBusy ? "rest" : "tap"}
                        >
                            {cancelText}
                        </motion.button>
                    )}

                    <motion.button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isBusy || disableConfirm}
                        className="flex-1 py-2 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: color }}
                        variants={buttonVariants}
                        initial="rest"
                        whileHover={isBusy || disableConfirm ? "rest" : "hover"}
                        whileTap={isBusy || disableConfirm ? "rest" : "tap"}
                    >
                        {isBusy && (
                           <LoaderComponent color="#ffffff" size={16} />
                        )}
                        {isBusy ? "Please wait…" : confirmText}
                    </motion.button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;