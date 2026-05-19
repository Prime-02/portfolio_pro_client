// components/ui/ErrorMessage.tsx
"use client";

import { motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

interface ErrorMessageProps {
    message: string;
    onDismiss?: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 
                 flex items-start gap-3"
        >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400 flex-1">{message}</p>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="p-1 rounded-lg hover:bg-red-500/20 transition-colors flex-shrink-0"
                >
                    <X className="w-4 h-4 text-red-500" />
                </button>
            )}
        </motion.div>
    );
}