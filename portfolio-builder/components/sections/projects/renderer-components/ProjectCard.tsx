// portfolio-builder/components/sections/projects/renderer-components/ProjectCard.tsx

import Image from "next/image";
import { PortfolioProjectResponse } from "@/lib/stores/projects/types/project.types";
import type { CardConfig } from "./resolveCardOverride";
import { ExternalLink, Calendar, DollarSign, User, Layers, GitBranch } from "lucide-react";
import MarkdownText from "@/src/app/components/markdown/MarkdownText";

interface ProjectCardProps {
    project: PortfolioProjectResponse;
    config: CardConfig;
    cardSize: "small" | "medium" | "large";
    /** When true the card stretches to fill its grid/flex container */
    fullWidth?: boolean;
}

const SIZE_PADDING = { small: "p-3", medium: "p-4", large: "p-5" } as const;
const IMAGE_HEIGHT = { small: "h-32", medium: "h-40", large: "h-52" } as const;
// List thumbnail — fixed square, doesn't stretch with row height
const LIST_IMAGE_SIZE = { small: "w-12 h-12", medium: "w-16 h-16", large: "w-20 h-20" } as const;
const LIST_IMAGE_DIMENSIONS = { small: 48, medium: 64, large: 80 } as const;
const THUMBNAIL_SIZE = { small: 48, medium: 64, large: 80 } as const;
const NAME_SIZE = { small: "text-sm", medium: "text-base", large: "text-lg" } as const;

function formatDate(dateStr: string | null | undefined, display: string): string {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (display === "relative") {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays < 30) return `${diffDays}d ago`;
        const diffMonths = Math.floor(diffDays / 30);
        if (diffMonths < 12) return `${diffMonths}mo ago`;
        const diffYears = Math.floor(diffMonths / 12);
        return `${diffYears}y ago`;
    }
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function StatusBadge({ status, display, accentColor }: { status?: string; display: string; accentColor?: string }) {
    if (!status || display === "hidden") return null;
    if (display === "text") return <span className="text-xs text-[var(--pb-text-muted)]">{status}</span>;

    const statusColors: Record<string, string> = {
        active: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
        archived: "bg-gray-500/15 text-gray-600 border-gray-500/30",
        draft: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    };
    const colorClass = statusColors[status.toLowerCase()] || "bg-[var(--pb-surface-elevated)] text-[var(--pb-text-muted)] border-[var(--pb-border)]";

    return (
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${colorClass}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {status}
        </span>
    );
}

function PlatformBadge({ platform, display, accentColor }: { platform?: string; display: string; accentColor?: string }) {
    if (!platform || display === "hidden") return null;
    if (display === "text") return <span className="text-xs text-[var(--pb-text-muted)]">{platform}</span>;
    if (display === "icon") return <GitBranch size={14} className="text-[var(--pb-text-muted)]" />;

    return (
        <span
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border"
            style={accentColor ? { borderColor: `${accentColor}40`, backgroundColor: `${accentColor}15`, color: accentColor } : undefined}
        >
            <GitBranch size={12} />
            {platform}
        </span>
    );
}

function CategoryBadge({ category, display, accentColor }: { category?: string; display: string; accentColor?: string }) {
    if (!category || display === "hidden") return null;
    if (display === "text") return <span className="text-xs text-[var(--pb-text-muted)]">{category}</span>;

    return (
        <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full border border-[var(--pb-border)] bg-[var(--pb-surface-elevated)] text-[var(--pb-text-muted)]">
            {category}
        </span>
    );
}

export default function ProjectCard({ project, config, cardSize, fullWidth = true }: ProjectCardProps) {
    const {
        style,
        showImage,
        showDescription,
        showUrl,
        showDates,
        showStatus,
        showPlatform,
        showCategory,
        showStack,
        showBudget,
        showClient,
        showContribution,
        dateDisplay,
        statusDisplay,
        platformDisplay,
        categoryDisplay,
        accentColor,
    } = config;

    const pad = SIZE_PADDING[cardSize];
    const imgH = IMAGE_HEIGHT[cardSize];
    const listImgSize = LIST_IMAGE_SIZE[cardSize];
    const listImgDimension = LIST_IMAGE_DIMENSIONS[cardSize];
    const thumbnailSize = THUMBNAIL_SIZE[cardSize];
    const nameText = NAME_SIZE[cardSize];
    const widthClass = fullWidth ? "w-full" : "";

    const accentStyle = accentColor
        ? ({ "--card-accent": accentColor } as React.CSSProperties)
        : undefined;

    // ── Compact ──────────────────────────────────────────────────────────────
    if (style === "compact") {
        return (
            <div
                className={`${widthClass} ${pad} rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] flex items-center gap-3 transition-all hover:border-[var(--pb-foreground-20)]`}
                style={accentStyle}
            >
                {showImage && project.project_image_url && (
                    <img
                        src={project.project_image_url}
                        alt={project.project_name || "Project image"}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-md object-cover shrink-0"
                    />
                )}
                <div className="flex-1 min-w-0">
                    <p className={`${nameText} font-medium text-[var(--pb-text-primary)] truncate`}>
                        {project.project_name}
                    </p>
                    {showCategory && (
                        <CategoryBadge category={project.project_category || undefined} display={categoryDisplay} accentColor={accentColor} />
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {showStatus && <StatusBadge status={project.status} display={statusDisplay} accentColor={accentColor} />}
                    {showPlatform && <PlatformBadge platform={project.project_platform} display={platformDisplay} accentColor={accentColor} />}
                </div>
            </div>
        );
    }

    // ── Minimal (List layout) ─────────────────────────────────────────────────
    if (style === "minimal") {
        return (
            <div
                className={`${widthClass} ${pad} rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] flex items-center gap-3 transition-all hover:border-[var(--pb-foreground-20)]`}
                style={accentStyle}
            >
                {/* Fixed-size thumbnail — never stretches with row height */}
                {showImage && project.project_image_url && (
                    <img
                        src={project.project_image_url}
                        alt={project.project_name || "Project image"}
                        width={listImgDimension}
                        height={listImgDimension}
                        className={`${listImgSize} rounded-md object-cover shrink-0`}
                    />
                )}

                {/* Centre: title + description + badges */}
                <div className="flex-1 min-w-0">
                    <p className={`${nameText} font-medium text-[var(--pb-text-primary)] truncate`}>
                        {project.project_name}
                    </p>
                    {showDescription && project.project_summary && (
                        <p className="text-xs text-[var(--pb-text-muted)] truncate">{project.project_summary}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {showCategory && <CategoryBadge category={project.project_category || undefined} display={categoryDisplay} accentColor={accentColor} />}
                        {showPlatform && <PlatformBadge platform={project.project_platform} display={platformDisplay} accentColor={accentColor} />}
                    </div>
                </div>

                {/* Right: status + date + link */}
                <div className="flex items-center gap-2 shrink-0">
                    {showStatus && <StatusBadge status={project.status} display={statusDisplay} accentColor={accentColor} />}
                    {showDates && project.start_date && (
                        <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(project.start_date, dateDisplay)}
                        </span>
                    )}
                    {showUrl && project.project_url && (
                        <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="text-[var(--pb-text-muted)] hover:text-[var(--pb-foreground)] transition-colors">
                            <ExternalLink size={14} />
                        </a>
                    )}
                </div>
            </div>
        );
    }

    // ── Hero ─────────────────────────────────────────────────────────────────
    if (style === "hero") {
        return (
            <div
                className={`${widthClass} rounded-xl overflow-hidden border border-[var(--pb-border)] bg-[var(--pb-surface)] transition-all hover:border-[var(--pb-foreground-20)] group`}
                style={accentStyle}
            >
                {showImage && project.project_image_url && (
                    <div className={`relative ${imgH} overflow-hidden`}>
                        <img
                            src={project.project_image_url}
                            alt={project.project_name || "Project image"}
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {/* Dark scrim — theme-independent, guarantees title contrast on bright images */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                        {/* Theme-blended fade on top for soft edge integration with card body */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--pb-surface)]/40 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                            <div>
                                <h3 className={`${nameText} font-bold text-white drop-shadow-lg`}>
                                    {project.project_name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    {showCategory && <CategoryBadge category={project.project_category || undefined} display={categoryDisplay} accentColor={accentColor} />}
                                    {showPlatform && <PlatformBadge platform={project.project_platform} display={platformDisplay} accentColor={accentColor} />}
                                </div>
                            </div>
                            {showStatus && <StatusBadge status={project.status} display={statusDisplay} accentColor={accentColor} />}
                        </div>
                    </div>
                )}
                <div className={pad}>
                    {showDescription && project.project_summary && (
                        <p className="text-sm text-[var(--pb-text-secondary)] leading-relaxed line-clamp-3 mb-3">
                            {project.project_summary}
                        </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                        {showDates && project.start_date && (
                            <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                                <Calendar size={12} />
                                {formatDate(project.start_date, dateDisplay)}
                                {project.end_date && ` - ${formatDate(project.end_date, dateDisplay)}`}
                            </span>
                        )}
                        {showBudget && project.budget && (
                            <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                                <DollarSign size={12} />
                                {project.budget.toLocaleString()}
                            </span>
                        )}
                        {showClient && project.client_name && (
                            <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                                <User size={12} />
                                {project.client_name}
                            </span>
                        )}
                        {showStack && project.stack && project.stack.length > 0 && (
                            <div className="flex items-center gap-1">
                                <Layers size={12} className="text-[var(--pb-text-muted)]" />
                                <div className="flex gap-1">
                                    {project.stack.slice(0, 4).map((tech, i) => (
                                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-[var(--pb-text-muted)]">
                                            {tech}
                                        </span>
                                    ))}
                                    {project.stack.length > 4 && (
                                        <span className="text-[10px] text-[var(--pb-text-muted)]">+{project.stack.length - 4}</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    {showUrl && project.project_url && (
                        <a
                            href={project.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[var(--pb-foreground)] hover:underline mt-3"
                        >
                            <ExternalLink size={12} />
                            View Project
                        </a>
                    )}
                </div>
            </div>
        );
    }

    // ── Detailed ─────────────────────────────────────────────────────────────
    if (style === "detailed") {
        return (
            <div
                className={`${widthClass} ${pad} rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)] space-y-3 transition-all hover:border-[var(--pb-foreground-20)]`}
                style={accentStyle}
            >
                <div className="flex items-start gap-3">
                    {showImage && project.project_image_url && (
                        <img
                            src={project.project_image_url}
                            alt={project.project_name || "Project image"}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-lg object-cover shrink-0"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className={`${nameText} font-semibold text-[var(--pb-text-primary)]`}>
                                {project.project_name}
                            </p>
                            {showStatus && <StatusBadge status={project.status} display={statusDisplay} accentColor={accentColor} />}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {showCategory && <CategoryBadge category={project.project_category || undefined} display={categoryDisplay} accentColor={accentColor} />}
                            {showPlatform && <PlatformBadge platform={project.project_platform} display={platformDisplay} accentColor={accentColor} />}
                        </div>
                    </div>
                </div>

                {showDescription && project.project_summary && (
                    <MarkdownText className="text-sm text-[var(--pb-text-secondary)] leading-relaxed line-clamp-3">
                        {project.project_summary}
                    </MarkdownText>
                )}

                {showContribution && project.user_associations?.[0]?.contribution_description && (
                    <div className="bg-[var(--pb-surface-elevated)] rounded-lg p-2.5 border border-[var(--pb-border)]">
                        <p className="text-xs text-[var(--pb-text-muted)] mb-1">My Contribution</p>
                        <p className="text-sm text-[var(--pb-text-secondary)]">{project.user_associations[0].contribution_description}</p>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                    {showDates && project.start_date && (
                        <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(project.start_date, dateDisplay)}
                            {project.end_date && ` - ${formatDate(project.end_date, dateDisplay)}`}
                        </span>
                    )}
                    {showBudget && project.budget && (
                        <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                            <DollarSign size={12} />
                            {project.budget.toLocaleString()}
                        </span>
                    )}
                    {showClient && project.client_name && (
                        <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                            <User size={12} />
                            {project.client_name}
                        </span>
                    )}
                </div>

                {showStack && project.stack && project.stack.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {project.stack.map((tech, i) => (
                            <span key={i} className="text-xs px-2 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-[var(--pb-text-muted)]">
                                {tech}
                            </span>
                        ))}
                    </div>
                )}

                {showUrl && project.project_url && (
                    <a
                        href={project.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[var(--pb-foreground)] hover:underline"
                    >
                        <ExternalLink size={12} />
                        View Project
                    </a>
                )}
            </div>
        );
    }

    // ── Standard (default) ────────────────────────────────────────────────────
    return (
        <div
            className={`${widthClass} ${pad} rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)] space-y-2.5 transition-all hover:border-[var(--pb-foreground-20)]`}
            style={accentStyle}
        >
            {showImage && project.project_image_url && (
                <div className={`${imgH} rounded-lg overflow-hidden mb-2 relative`}>
                    <img
                        src={project.project_image_url}
                        alt={project.project_name || "Project image"}
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
                <p className={`${nameText} font-semibold text-[var(--pb-text-primary)] truncate flex-1`}>
                    {project.project_name}
                </p>
                {showStatus && <StatusBadge status={project.status} display={statusDisplay} accentColor={accentColor} />}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                {showCategory && <CategoryBadge category={project.project_category || undefined} display={categoryDisplay} accentColor={accentColor} />}
                {showPlatform && <PlatformBadge platform={project.project_platform} display={platformDisplay} accentColor={accentColor} />}
            </div>

            {showDescription && project.project_summary && (
                <p className="text-sm text-[var(--pb-text-secondary)] line-clamp-2">{project.project_summary}</p>
            )}

            <div className="flex items-center justify-between pt-1 gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    {showDates && project.start_date && (
                        <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(project.start_date, dateDisplay)}
                        </span>
                    )}
                    {showBudget && project.budget && (
                        <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                            <DollarSign size={12} />
                            {project.budget.toLocaleString()}
                        </span>
                    )}
                </div>
                {showUrl && project.project_url && (
                    <a
                        href={project.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--pb-text-muted)] hover:text-[var(--pb-foreground)] transition-colors"
                    >
                        <ExternalLink size={14} />
                    </a>
                )}
            </div>

            {showStack && project.stack && project.stack.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                    {project.stack.slice(0, 5).map((tech, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-[var(--pb-text-muted)]">
                            {tech}
                        </span>
                    ))}
                    {project.stack.length > 5 && (
                        <span className="text-[10px] text-[var(--pb-text-muted)]">+{project.stack.length - 5}</span>
                    )}
                </div>
            )}
        </div>
    );
}