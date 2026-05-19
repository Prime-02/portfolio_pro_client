"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Pencil, Trash2, ExternalLink, Award, Building2,
    Calendar, Clock, CheckCircle2, AlertCircle, Globe, ChevronDown, Lock
} from "lucide-react";
import type { Certification } from "@/lib/stores/certifications/useCertifications";

interface CertificationCardProps {
    certification: Certification;
    onEdit: () => void;
    onDelete: () => void;
    isOwner?: boolean;
}

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getExpiryStatus(expirationDate: string | null | undefined): "active" | "expiring-soon" | "expired" | "no-expiry" {
    if (!expirationDate) return "no-expiry";
    const now = new Date();
    const expiry = new Date(expirationDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) return "expired";
    if (daysUntilExpiry <= 90) return "expiring-soon";
    return "active";
}

export function CertificationCard({ certification, onEdit, onDelete, isOwner = false }: CertificationCardProps) {
    const [expanded, setExpanded] = useState(false);
    const expiryStatus = getExpiryStatus(certification.expiration_date);

    const statusConfig = {
        "active": { color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle2, label: "Active" },
        "expiring-soon": { color: "text-amber-500", bg: "bg-amber-500/10", icon: AlertCircle, label: "Expiring Soon" },
        "expired": { color: "text-red-500", bg: "bg-red-500/10", icon: AlertCircle, label: "Expired" },
        "no-expiry": { color: "text-blue-500", bg: "bg-blue-500/10", icon: CheckCircle2, label: "No Expiry" },
    };

    const status = statusConfig[expiryStatus];
    const StatusIcon = status.icon;

    const accentColor = expiryStatus === "expired"
        ? "#ef4444"
        : expiryStatus === "expiring-soon"
            ? "#f59e0b"
            : "var(--accent)";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative rounded-2xl border border-[var(--foreground)]/10 
                       bg-[var(--background)] hover:border-[var(--foreground)]/20 
                       transition-all duration-300 overflow-hidden"
        >
            {/* Color accent bar */}
            <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: accentColor }}
            />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                            className="p-2.5 rounded-xl flex-shrink-0"
                            style={{ backgroundColor: `${accentColor}20` }}
                        >
                            <Award className="w-5 h-5" style={{ color: accentColor }} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-league-600 text-base leading-tight truncate">
                                {certification.certification_name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Building2 className="w-3 h-3 text-[var(--foreground)]/40 flex-shrink-0" />
                                <p className="text-xs text-[var(--foreground)]/50 truncate">
                                    {certification.issuing_organization}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions — only for owner */}
                    {isOwner && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                            <button
                                onClick={onEdit}
                                className="p-2 rounded-lg hover:bg-[var(--foreground)]/10 transition-colors"
                                title="Edit"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={onDelete}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Status badge */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${status.bg} ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                </div>

                {/* Dates */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                    {certification.issue_date && (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--foreground)]/50">
                            <Calendar className="w-3 h-3" />
                            <span>Issued {formatDate(certification.issue_date)}</span>
                        </div>
                    )}
                    {certification.expiration_date && (
                        <div className={`flex items-center gap-1.5 text-xs ${expiryStatus === "expired" ? "text-red-500" : expiryStatus === "expiring-soon" ? "text-amber-500" : "text-[var(--foreground)]/50"}`}>
                            <Clock className="w-3 h-3" />
                            <span>
                                {expiryStatus === "expired" ? "Expired" : "Expires"} {formatDate(certification.expiration_date)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Links */}
                <div className="flex flex-wrap gap-2">
                    {certification.certificate_external_url && (
                        <a
                            href={certification.certificate_external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                                       bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 
                                       transition-colors text-[var(--foreground)]/70"
                        >
                            <Globe className="w-3 h-3" />
                            View Certificate
                            <ExternalLink className="w-3 h-3 opacity-50" />
                        </a>
                    )}
                    {certification.certificate_internal_url && (
                        <a
                            href={certification.certificate_internal_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                                       bg-[var(--accent)]/10 hover:bg-[var(--accent)]/15 
                                       transition-colors text-[var(--accent)]"
                        >
                            <Lock className="w-3 h-3" />
                            File
                            <ExternalLink className="w-3 h-3 opacity-50" />
                        </a>
                    )}
                </div>

                {/* Visibility indicator — only for owner */}
                {isOwner && certification.is_public === false && (
                    <div className="mt-3">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="flex items-center gap-1 text-xs text-[var(--foreground)]/40 hover:text-[var(--foreground)]/60 transition-colors"
                        >
                            <Lock className="w-3 h-3" />
                            <span>Private</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
                        </button>
                        <motion.div
                            initial={false}
                            animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <p className="mt-1.5 text-xs text-[var(--foreground)]/40">
                                This certification is only visible to you.
                            </p>
                        </motion.div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}