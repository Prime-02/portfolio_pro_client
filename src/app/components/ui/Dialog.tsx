// components/ui/Dialog.tsx
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// ---------------------------------------------------------------------------
// Dialog Context
// ---------------------------------------------------------------------------

interface DialogContextValue {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined);

function useDialogContext() {
    const context = React.useContext(DialogContext);
    if (!context) {
        throw new Error("Dialog components must be used within <Dialog />");
    }
    return context;
}

// ---------------------------------------------------------------------------
// Dialog Root
// ---------------------------------------------------------------------------

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    // Close on Escape key
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onOpenChange(false);
        };

        if (open) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [open, onOpenChange]);

    return (
        <DialogContext.Provider value={{ open, onOpenChange }}>
            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => onOpenChange(false)}
                        />

                        {/* Content */}
                        {children}
                    </div>
                )}
            </AnimatePresence>
        </DialogContext.Provider>
    );
}

// ---------------------------------------------------------------------------
// Dialog Content
// ---------------------------------------------------------------------------

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogContent({ className, children }: DialogContentProps) {
    const { onOpenChange } = useDialogContext();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`relative z-50 w-full max-w-lg mx-4 rounded-2xl border border-foreground/15 bg-background shadow-2xl p-6 max-h-[85vh] overflow-y-auto custom-scrollbar ${className || ""}`}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Close button */}
            <button
                onClick={() => onOpenChange(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-foreground/50 hover:text-foreground hover:bg-foreground/10 transition-colors z-10"
            >
                <X className="w-4 h-4" />
                <span className="sr-only">Close</span>
            </button>

            {children}
        </motion.div>
    );
}

// ---------------------------------------------------------------------------
// Dialog Header
// ---------------------------------------------------------------------------

interface DialogHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogHeader({ className, children }: DialogHeaderProps) {
    return (
        <div
            className={`flex flex-col space-y-2 text-center sm:text-left ${className || ""}`}
        >
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Dialog Title
// ---------------------------------------------------------------------------

interface DialogTitleProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogTitle({ className, children }: DialogTitleProps) {
    return (
        <h2
            className={`text-xl font-league-600 tracking-tight text-foreground ${className || ""}`}
        >
            {children}
        </h2>
    );
}

// ---------------------------------------------------------------------------
// Dialog Description
// ---------------------------------------------------------------------------

interface DialogDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogDescription({ className, children }: DialogDescriptionProps) {
    return (
        <p
            className={`text-sm text-foreground/60 leading-relaxed ${className || ""}`}
        >
            {children}
        </p>
    );
}

// ---------------------------------------------------------------------------
// Dialog Footer
// ---------------------------------------------------------------------------

interface DialogFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogFooter({ className, children }: DialogFooterProps) {
    return (
        <div
            className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 mt-6 gap-3 ${className || ""}`}
        >
            {children}
        </div>
    );
}