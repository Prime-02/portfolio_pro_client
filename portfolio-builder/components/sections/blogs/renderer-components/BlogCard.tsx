// portfolio-builder/components/sections/blogs/renderer-components/BlogCard.tsx

import { ContentWithAuthor } from "@/lib/stores/contents/types/content.types";
import type { CardConfig } from "./resolveCardOverride";
import { ExternalLink, Calendar, Eye, MessageCircle, Heart, Share2, Bookmark, Clock, User } from "lucide-react";
import MarkdownText from "@/src/app/components/markdown/MarkdownText";

interface BlogCardProps {
    blog: ContentWithAuthor;
    config: CardConfig;
    cardSize: "small" | "medium" | "large";
    fullWidth?: boolean;
    index?: number;
}

const SIZE_PADDING = { small: "p-3", medium: "p-4", large: "p-5" } as const;
const IMAGE_HEIGHT = { small: "h-28", medium: "h-36", large: "h-48" } as const;
const LIST_IMAGE_SIZE = { small: "w-12 h-12", medium: "w-16 h-16", large: "w-20 h-20" } as const;
const TITLE_SIZE = { small: "text-sm", medium: "text-base", large: "text-lg" } as const;

function formatDate(dateStr: string | null | undefined, display: string): string {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (display === "relative") {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays < 1) return "Today";
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
        return `${Math.floor(diffDays / 365)}y ago`;
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function estimateReadTime(body?: string | null): string {
    if (!body) return "1 min read";
    const words = body.trim().split(/\s+/).length;
    const mins = Math.max(1, Math.ceil(words / 200));
    return `${mins} min read`;
}

function StatusBadge({ status, display, accentColor }: { status?: string; display: string; accentColor?: string }) {
    if (!status || display === "hidden") return null;
    if (display === "text") return <span className="text-xs text-[var(--pb-text-muted)]">{status}</span>;

    const statusColors: Record<string, string> = {
        DRAFT: "bg-amber-500/15 text-amber-600 border-amber-500/30",
        PUBLISHED: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
        ARCHIVED: "bg-gray-500/15 text-gray-600 border-gray-500/30",
        SCHEDULED: "bg-blue-500/15 text-blue-600 border-blue-500/30",
        DELETED: "bg-red-500/15 text-red-600 border-red-500/30",
    };
    const colorClass = statusColors[status] || "bg-[var(--pb-surface-elevated)] text-[var(--pb-text-muted)] border-[var(--pb-border)]";

    return (
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${colorClass}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {status}
        </span>
    );
}

function ReactionDisplay({ likes, display, accentColor }: { likes?: number; display: string; accentColor?: string }) {
    if (display === "hidden") return null;
    if (display === "count") return <span className="text-xs text-[var(--pb-text-muted)]">{likes || 0} likes</span>;
    if (display === "badge") return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-[var(--pb-border)] bg-[var(--pb-surface-elevated)] text-[var(--pb-text-muted)]">
            <Heart size={12} /> {likes || 0}
        </span>
    );

    return (
        <span className="inline-flex items-center gap-1 text-xs text-[var(--pb-text-muted)]">
            <Heart size={14} className={likes ? "text-red-400 fill-red-400" : ""} /> {likes || 0}
        </span>
    );
}

function CategoryBadge({ category, accentColor }: { category?: string | null; accentColor?: string }) {
    if (!category) return null;
    return (
        <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full border border-[var(--pb-border)] bg-[var(--pb-surface-elevated)] text-[var(--pb-text-muted)]">
            {category}
        </span>
    );
}

export default function BlogCard({ blog, config, cardSize, fullWidth = true, index }: BlogCardProps) {
    const {
        style,
        showImage,
        showTitle,
        showExcerpt,
        showBody,
        showAuthor,
        showDates,
        showStatus,
        showTags,
        showCategory,
        showReactions,
        showComments,
        showViews,
        showReadTime,
        showShare,
        showBookmark,
        showUrl,
        dateDisplay,
        statusDisplay,
        reactionDisplay,
        accentColor,
    } = config;

    const pad = SIZE_PADDING[cardSize];
    const imgH = IMAGE_HEIGHT[cardSize];
    const listImgSize = LIST_IMAGE_SIZE[cardSize];
    const titleText = TITLE_SIZE[cardSize];
    const widthClass = fullWidth ? "w-full" : "";

    const accentStyle = accentColor
        ? ({ "--card-accent": accentColor } as React.CSSProperties)
        : undefined;

    const authorName = blog.author?.display_name || blog.author?.username || "Anonymous";
    const authorImage = blog.author?.profile_picture;

    // ── Compact ──────────────────────────────────────────────────────────────
    if (style === "compact") {
        return (
            <div className={`${widthClass} ${pad} rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] flex items-center gap-3 transition-all hover:border-[var(--pb-foreground-20)]`} style={accentStyle}>
                {showImage && blog.cover_image_url && (
                    <img src={blog.cover_image_url} alt={blog.title} className="w-12 h-12 rounded-md object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                    {showTitle && <p className={`${titleText} font-medium text-[var(--pb-text-primary)] truncate`}>{blog.title}</p>}
                    <div className="flex items-center gap-2 flex-wrap">
                        {showCategory && <CategoryBadge category={blog.category} accentColor={accentColor} />}
                        {showDates && blog.published_at && <span className="text-xs text-[var(--pb-text-muted)]">{formatDate(blog.published_at, dateDisplay)}</span>}
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {showStatus && <StatusBadge status={blog.status} display={statusDisplay} accentColor={accentColor} />}
                    {showReactions && <ReactionDisplay likes={blog.likes_count} display={reactionDisplay} accentColor={accentColor} />}
                </div>
            </div>
        );
    }

    // ── Minimal (Reading List) ───────────────────────────────────────────────
    if (style === "minimal") {
        return (
            <div className={`${widthClass} ${pad} rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] flex items-center gap-3 transition-all hover:border-[var(--pb-foreground-20)]`} style={accentStyle}>
                {showImage && blog.cover_image_url && (
                    <img src={blog.cover_image_url} alt={blog.title} className={`${listImgSize} rounded-md object-cover shrink-0`} />
                )}
                <div className="flex-1 min-w-0">
                    {showTitle && <p className={`${titleText} font-medium text-[var(--pb-text-primary)] truncate`}>{blog.title}</p>}
                    {showExcerpt && blog.excerpt && (
                        <MarkdownText className="text-xs text-[var(--pb-text-muted)] truncate">{blog.excerpt}</MarkdownText>
                    )}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {showCategory && <CategoryBadge category={blog.category} accentColor={accentColor} />}
                        {showTags && blog.tags && blog.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="text-[10px] text-[var(--pb-text-muted)]">#{tag}</span>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {showStatus && <StatusBadge status={blog.status} display={statusDisplay} accentColor={accentColor} />}
                    {showDates && blog.published_at && (
                        <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                            <Calendar size={12} /> {formatDate(blog.published_at, dateDisplay)}
                        </span>
                    )}
                    {showUrl && (
                        <a href={`/content/${blog.slug || blog.id}`} className="text-[var(--pb-text-muted)] hover:text-[var(--pb-foreground)] transition-colors">
                            <ExternalLink size={14} />
                        </a>
                    )}
                </div>
            </div>
        );
    }

    // ── Featured ─────────────────────────────────────────────────────────────
    if (style === "featured") {
        return (
            <div className={`${widthClass} rounded-xl overflow-hidden border border-[var(--pb-border)] bg-[var(--pb-surface)] transition-all hover:border-[var(--pb-foreground-20)] group`} style={accentStyle}>
                {showImage && blog.cover_image_url && (
                    <div className={`relative ${imgH} overflow-hidden`}>
                        <img src={blog.cover_image_url} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--pb-surface)]/40 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                            <div>
                                {showTitle && <h3 className={`${titleText} font-bold text-white drop-shadow-lg`}>{blog.title}</h3>}
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    {showCategory && <CategoryBadge category={blog.category} accentColor={accentColor} />}
                                    {showTags && blog.tags && blog.tags.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white/90 backdrop-blur">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            {showStatus && <StatusBadge status={blog.status} display={statusDisplay} accentColor={accentColor} />}
                        </div>
                    </div>
                )}
                <div className={pad}>
                    {showExcerpt && blog.excerpt && (
                        <MarkdownText className="text-sm text-[var(--pb-text-secondary)] leading-relaxed line-clamp-3 mb-3">{blog.excerpt}</MarkdownText>
                    )}
                    {showBody && blog.body && (
                        <MarkdownText className="text-sm text-[var(--pb-text-secondary)] leading-relaxed line-clamp-4 mb-3">{blog.body}</MarkdownText>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                        {showAuthor && (
                            <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                                {authorImage ? <img src={authorImage} alt={authorName} className="w-4 h-4 rounded-full object-cover" /> : <User size={12} />}
                                {authorName}
                            </span>
                        )}
                        {showDates && blog.published_at && (
                            <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                                <Calendar size={12} /> {formatDate(blog.published_at, dateDisplay)}
                            </span>
                        )}
                        {showReadTime && (
                            <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                                <Clock size={12} /> {estimateReadTime(blog.body)}
                            </span>
                        )}
                        {showViews && (
                            <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                                <Eye size={12} /> {blog.views_count || 0}
                            </span>
                        )}
                        {showComments && (
                            <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                                <MessageCircle size={12} /> {blog.comments_count || 0}
                            </span>
                        )}
                        {showReactions && <ReactionDisplay likes={blog.likes_count} display={reactionDisplay} accentColor={accentColor} />}
                    </div>
                    {showUrl && (
                        <a href={`/content/${blog.slug || blog.id}`} className="inline-flex items-center gap-1 text-xs text-[var(--pb-foreground)] hover:underline mt-3">
                            <ExternalLink size={12} /> Read More
                        </a>
                    )}
                </div>
            </div>
        );
    }

    // ── Magazine ─────────────────────────────────────────────────────────────
    if (style === "magazine") {
        return (
            <div className={`${widthClass} ${pad} rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)] space-y-3 transition-all hover:border-[var(--pb-foreground-20)]`} style={accentStyle}>
                <div className="flex items-start gap-3">
                    {showImage && blog.cover_image_url && (
                        <img src={blog.cover_image_url} alt={blog.title} className="w-20 h-20 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            {showCategory && <CategoryBadge category={blog.category} accentColor={accentColor} />}
                            {showStatus && <StatusBadge status={blog.status} display={statusDisplay} accentColor={accentColor} />}
                        </div>
                        {showTitle && <p className={`${titleText} font-semibold text-[var(--pb-text-primary)] leading-tight`}>{blog.title}</p>}
                        {showExcerpt && blog.excerpt && (
                            <MarkdownText className="text-sm text-[var(--pb-text-secondary)] line-clamp-2 mt-1">{blog.excerpt}</MarkdownText>
                        )}
                    </div>
                </div>

                {showBody && blog.body && (
                    <MarkdownText className="text-sm text-[var(--pb-text-secondary)] leading-relaxed line-clamp-3">{blog.body}</MarkdownText>
                )}

                {showTags && blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {blog.tags.map((tag, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-[var(--pb-text-muted)]">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--pb-border)]">
                    {showAuthor && (
                        <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                            {authorImage ? <img src={authorImage} alt={authorName} className="w-4 h-4 rounded-full object-cover" /> : <User size={12} />}
                            {authorName}
                        </span>
                    )}
                    {showDates && blog.published_at && (
                        <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                            <Calendar size={12} /> {formatDate(blog.published_at, dateDisplay)}
                        </span>
                    )}
                    {showReadTime && (
                        <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                            <Clock size={12} /> {estimateReadTime(blog.body)}
                        </span>
                    )}
                    {showViews && (
                        <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                            <Eye size={12} /> {blog.views_count || 0}
                        </span>
                    )}
                    {showComments && (
                        <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                            <MessageCircle size={12} /> {blog.comments_count || 0}
                        </span>
                    )}
                    {showReactions && <ReactionDisplay likes={blog.likes_count} display={reactionDisplay} accentColor={accentColor} />}
                    <div className="flex items-center gap-1 ml-auto">
                        {showShare && (
                            <button className="p-1 rounded-md hover:bg-[var(--pb-surface-hover)] text-[var(--pb-text-muted)] hover:text-[var(--pb-text-primary)] transition-colors">
                                <Share2 size={14} />
                            </button>
                        )}
                        {showBookmark && (
                            <button className="p-1 rounded-md hover:bg-[var(--pb-surface-hover)] text-[var(--pb-text-muted)] hover:text-[var(--pb-text-primary)] transition-colors">
                                <Bookmark size={14} />
                            </button>
                        )}
                        {showUrl && (
                            <a href={`/content/${blog.slug || blog.id}`} className="text-[var(--pb-text-muted)] hover:text-[var(--pb-foreground)] transition-colors">
                                <ExternalLink size={14} />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ── Detailed ─────────────────────────────────────────────────────────────
    if (style === "detailed") {
        return (
            <div className={`${widthClass} ${pad} rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)] space-y-3 transition-all hover:border-[var(--pb-foreground-20)]`} style={accentStyle}>
                <div className="flex items-start gap-3">
                    {showImage && blog.cover_image_url && (
                        <img src={blog.cover_image_url} alt={blog.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            {showTitle && <p className={`${titleText} font-semibold text-[var(--pb-text-primary)]`}>{blog.title}</p>}
                            {showStatus && <StatusBadge status={blog.status} display={statusDisplay} accentColor={accentColor} />}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {showCategory && <CategoryBadge category={blog.category} accentColor={accentColor} />}
                            {showTags && blog.tags && blog.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="text-[10px] text-[var(--pb-text-muted)]">#{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {showExcerpt && blog.excerpt && (
                    <MarkdownText className="text-sm text-[var(--pb-text-secondary)] leading-relaxed line-clamp-3">{blog.excerpt}</MarkdownText>
                )}
                {showBody && blog.body && (
                    <MarkdownText className="text-sm text-[var(--pb-text-secondary)] leading-relaxed line-clamp-4">{blog.body}</MarkdownText>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                    {showAuthor && (
                        <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                            {authorImage ? <img src={authorImage} alt={authorName} className="w-4 h-4 rounded-full object-cover" /> : <User size={12} />}
                            {authorName}
                        </span>
                    )}
                    {showDates && blog.published_at && (
                        <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                            <Calendar size={12} /> {formatDate(blog.published_at, dateDisplay)}
                        </span>
                    )}
                    {showReadTime && (
                        <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                            <Clock size={12} /> {estimateReadTime(blog.body)}
                        </span>
                    )}
                    {showViews && (
                        <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                            <Eye size={12} /> {blog.views_count || 0}
                        </span>
                    )}
                    {showComments && (
                        <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                            <MessageCircle size={12} /> {blog.comments_count || 0}
                        </span>
                    )}
                    {showReactions && <ReactionDisplay likes={blog.likes_count} display={reactionDisplay} accentColor={accentColor} />}
                </div>

                {showUrl && (
                    <a href={`/content/${blog.slug || blog.id}`} className="inline-flex items-center gap-1 text-xs text-[var(--pb-foreground)] hover:underline">
                        <ExternalLink size={12} /> Read More
                    </a>
                )}
            </div>
        );
    }

    // ── Standard (default) ───────────────────────────────────────────────────
    return (
        <div className={`${widthClass} ${pad} rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)] space-y-2.5 transition-all hover:border-[var(--pb-foreground-20)]`} style={accentStyle}>
            {showImage && blog.cover_image_url && (
                <div className={`${imgH} rounded-lg overflow-hidden mb-2`}>
                    <img src={blog.cover_image_url} alt={blog.title} className="w-full h-full object-cover" />
                </div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
                {showTitle && <p className={`${titleText} font-semibold text-[var(--pb-text-primary)] truncate flex-1`}>{blog.title}</p>}
                {showStatus && <StatusBadge status={blog.status} display={statusDisplay} accentColor={accentColor} />}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                {showCategory && <CategoryBadge category={blog.category} accentColor={accentColor} />}
                {showTags && blog.tags && blog.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-[10px] text-[var(--pb-text-muted)]">#{tag}</span>
                ))}
            </div>
            {showExcerpt && blog.excerpt && (
                <MarkdownText className="text-sm text-[var(--pb-text-secondary)] line-clamp-2">{blog.excerpt}</MarkdownText>
            )}
            <div className="flex items-center justify-between pt-1 gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    {showAuthor && (
                        <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                            {authorImage ? <img src={authorImage} alt={authorName} className="w-4 h-4 rounded-full object-cover" /> : <User size={12} />}
                            {authorName}
                        </span>
                    )}
                    {showDates && blog.published_at && (
                        <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                            <Calendar size={12} /> {formatDate(blog.published_at, dateDisplay)}
                        </span>
                    )}
                    {showReadTime && (
                        <span className="text-xs text-[var(--pb-text-muted)] flex items-center gap-1">
                            <Clock size={12} /> {estimateReadTime(blog.body)}
                        </span>
                    )}
                </div>
                {showUrl && (
                    <a href={`/content/${blog.slug || blog.id}`} className="text-[var(--pb-text-muted)] hover:text-[var(--pb-foreground)] transition-colors">
                        <ExternalLink size={14} />
                    </a>
                )}
            </div>
            <div className="flex items-center gap-2 pt-1">
                {showViews && (
                    <span className="text-[10px] text-[var(--pb-text-muted)] flex items-center gap-1">
                        <Eye size={10} /> {blog.views_count || 0}
                    </span>
                )}
                {showComments && (
                    <span className="text-[10px] text-[var(--pb-text-muted)] flex items-center gap-1">
                        <MessageCircle size={10} /> {blog.comments_count || 0}
                    </span>
                )}
                {showReactions && <ReactionDisplay likes={blog.likes_count} display={reactionDisplay} accentColor={accentColor} />}
            </div>
        </div>
    );
}
