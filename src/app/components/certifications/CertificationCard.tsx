"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Pencil, Trash2, ExternalLink, Award, Building2,
    Calendar, Clock, CheckCircle2, AlertCircle, Globe, ChevronDown, Lock,
    Eye, EyeOff, Maximize2, FileText, Loader2,
    ImageIcon
} from "lucide-react";
import type { Certification } from "@/lib/stores/certifications/useCertifications";
import { useUIStore } from "@/lib/stores/ui/useUIStore";

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

function getFileTypeFromUrl(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const pdfTypes = ['pdf'];

    if (imageTypes.includes(extension)) return 'image';
    if (pdfTypes.includes(extension)) return 'pdf';
    return 'other';
}

export function CertificationCard({ certification, onEdit, onDelete, isOwner = false }: CertificationCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [showFilePreview, setShowFilePreview] = useState(false);
    const [iframeLoading, setIframeLoading] = useState(true);
    const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number } | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { isDesktop } = useUIStore();
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

    const fileType = certification.certificate_internal_url
        ? getFileTypeFromUrl(certification.certificate_internal_url)
        : null;

    const getFileNameFromUrl = (url: string) => {
        const parts = url.split("/");
        const fullName = parts[parts.length - 1] || "certificate-file";
        return fullName.split('?')[0];
    };

    // Handle iframe load event to get natural dimensions for images
    useEffect(() => {
        if (!showFilePreview || !certification.certificate_internal_url || fileType !== 'image') {
            setNaturalDimensions(null);
            return;
        }

        setIframeLoading(true);

        // For images, we can try to get natural dimensions
        const img = new window.Image();
        img.onload = () => {
            const maxWidth = containerRef.current?.clientWidth || 500;
            const maxHeight = 600; // Maximum height for the preview

            let width = img.naturalWidth;
            let height = img.naturalHeight;

            // Scale down if image is larger than container
            if (width > maxWidth) {
                const ratio = maxWidth / width;
                width = maxWidth;
                height = height * ratio;
            }

            // If still too tall, scale down further
            if (height > maxHeight) {
                const ratio = maxHeight / height;
                height = maxHeight;
                width = width * ratio;
            }

            setNaturalDimensions({ width, height });
            setIframeLoading(false);
        };

        img.onerror = () => {
            setIframeLoading(false);
        };

        img.src = certification.certificate_internal_url;
    }, [showFilePreview, certification.certificate_internal_url, fileType]);

    // Set iframe loading to false for non-image files after a timeout
    useEffect(() => {
        if (showFilePreview && fileType !== 'image') {
            const timer = setTimeout(() => {
                setIframeLoading(false);
            }, 2000); // Give PDFs 2 seconds to load

            return () => clearTimeout(timer);
        }
    }, [showFilePreview, fileType]);

    const getIframeHeight = () => {
        if (fileType === 'image' && naturalDimensions) {
            return naturalDimensions.height;
        }
        if (fileType === 'pdf') {
            return 500; // Fixed height for PDFs
        }
        return 400; // Default height for other files
    };

    const getIframeWidth = () => {
        if (fileType === 'image' && naturalDimensions) {
            return naturalDimensions.width;
        }
        return '100%';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative rounded-2xl border border-[var(--foreground)]/10 
                       bg-[var(--background)] hover:border-[var(--foreground)]/20 
                       transition-all duration-300 overflow-hidden h-fit"
        >
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
                        <motion.div
                            initial={isDesktop ? { opacity: 0 } : { opacity: 1 }}
                            animate={{ opacity: !isDesktop || isHovered ? 1 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex gap-1 flex-shrink-0 ml-2"
                        >
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
                        </motion.div>
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
                <div className="flex flex-wrap gap-2 mb-3">
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
                        <button
                            onClick={() => setShowFilePreview(!showFilePreview)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                                       bg-[var(--accent)]/10 hover:bg-[var(--accent)]/15 
                                       transition-colors text-[var(--accent)]"
                        >
                            {showFilePreview ? (
                                <>
                                    <EyeOff className="w-3 h-3" />
                                    Hide File
                                </>
                            ) : (
                                <>
                                    {fileType === 'image' ? (
                                        <ImageIcon className="w-3 h-3"  />
                                    ) : fileType === 'pdf' ? (
                                        <FileText className="w-3 h-3" />
                                    ) : (
                                        <Eye className="w-3 h-3" />
                                    )}
                                    Preview File
                                    <Maximize2 className="w-3 h-3 opacity-50" />
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* File Preview — expands within the card */}
                <AnimatePresence>
                    {showFilePreview && certification.certificate_internal_url && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="pt-3 border-t border-[var(--foreground)]/10">
                                {/* File info bar */}
                                <div className="flex items-center justify-between mb-3 px-3 py-2 bg-[var(--foreground)]/5 rounded-lg">
                                    <div className="flex items-center gap-2 min-w-0">
                                        {fileType === 'image' ? (
                                            <ImageIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        ) : fileType === 'pdf' ? (
                                            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                        ) : (
                                            <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                        )}
                                        <span className="text-xs text-[var(--foreground)]/70 truncate">
                                            {getFileNameFromUrl(certification.certificate_internal_url)}
                                        </span>
                                    </div>
                                    <a
                                        href={certification.certificate_internal_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 px-2 py-1 rounded-md text-xs
                                                   hover:bg-[var(--foreground)]/10 transition-colors
                                                   text-[var(--foreground)]/50 hover:text-[var(--foreground)]/70 flex-shrink-0"
                                        title="Open in new tab"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>Open</span>
                                    </a>
                                </div>

                                {/* Iframe container with dynamic dimensions */}
                                <div
                                    ref={containerRef}
                                    className="relative mx-auto rounded-xl overflow-hidden border border-[var(--foreground)]/10 bg-white"
                                    style={{
                                        width: fileType === 'image' && naturalDimensions
                                            ? `${naturalDimensions.width}px`
                                            : '100%',
                                        maxWidth: '100%',
                                    }}
                                >
                                    {/* Loading state */}
                                    {iframeLoading && (
                                        <div
                                            className="absolute inset-0 flex items-center justify-center bg-[var(--foreground)]/5 z-10"
                                            style={{
                                                height: getIframeHeight(),
                                            }}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
                                                <span className="text-xs text-[var(--foreground)]/50">
                                                    Loading preview...
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <iframe
                                        ref={iframeRef}
                                        src={certification.certificate_internal_url}
                                        className="w-full block"
                                        style={{
                                            height: getIframeHeight(),
                                            border: 'none',
                                            opacity: iframeLoading ? 0 : 1,
                                            transition: 'opacity 0.3s ease',
                                        }}
                                        title={`Preview of ${certification.certification_name}`}
                                        sandbox="allow-scripts allow-same-origin"
                                        onLoad={() => {
                                            if (fileType !== 'image') {
                                                setIframeLoading(false);
                                            }
                                        }}
                                    />

                                    {/* Subtle gradient overlay for scroll indication (PDFs only) */}
                                    {fileType === 'pdf' && !iframeLoading && (
                                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
                                    )}
                                </div>

                                {/* Preview info */}
                                {fileType === 'image' && naturalDimensions && (
                                    <p className="text-[10px] text-[var(--foreground)]/30 text-center mt-2">
                                        {naturalDimensions.width.toFixed(0)} × {naturalDimensions.height.toFixed(0)}px
                                    </p>
                                )}
                                {fileType === 'pdf' && (
                                    <p className="text-[10px] text-[var(--foreground)]/30 text-center mt-2">
                                        Scroll to view full document
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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