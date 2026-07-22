// portfolio-builder/components/sections/testimonials/renderer-components/TestimonialCard.tsx

import Image from "@/src/app/components/ui/Image";
import { Testimonial } from "@/lib/stores/testimonials/useTestimonial";
import type { CardConfig } from "./resolveCardOverride";
import { Star, Quote, BadgeCheck } from "lucide-react";
import MarkdownText from "@/src/app/components/markdown/MarkdownText";

interface TestimonialCardProps {
  testimonial: Testimonial;
  config: CardConfig;
  cardSize: "small" | "medium" | "large";
  /** When true the card stretches to fill its grid/flex container */
  fullWidth?: boolean;
}

const SIZE_PADDING = { small: "p-4", medium: "p-5", large: "p-6" } as const;
const AVATAR_SIZE = { small: "w-10 h-10", medium: "w-12 h-12", large: "w-14 h-14" } as const;
const AVATAR_DIMENSIONS = { small: 40, medium: 48, large: 56 } as const;
const NAME_SIZE = { small: "text-sm", medium: "text-base", large: "text-lg" } as const;
const CONTENT_SIZE = { small: "text-xs", medium: "text-sm", large: "text-base" } as const;
const QUOTE_SIZE = { small: "w-5 h-5", medium: "w-6 h-6", large: "w-8 h-8" } as const;

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

function StarRating({ rating, display, size }: { rating?: number; display: string; size: string }) {
  if (!rating || display === "hidden") return null;

  const starClass = size === "small" ? "w-3 h-3" : size === "medium" ? "w-4 h-4" : "w-5 h-5";

  if (display === "number") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500">
        <Star className={starClass} fill="currentColor" />
        {rating.toFixed(1)}
      </span>
    );
  }

  if (display === "badge") {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/30">
        <Star className="w-3 h-3" fill="currentColor" />
        {rating.toFixed(1)}
      </span>
    );
  }

  // stars display
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${starClass} ${i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

function FeaturedBadge({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 font-medium">
      <BadgeCheck className="w-3 h-3" />
      Featured
    </span>
  );
}
type AvatarSize = keyof typeof AVATAR_SIZE;

function Avatar({
  url,
  name,
  display,
  size,
}: {
  url?: string;
  name: string;
  display: string;
  size: AvatarSize;
}) {
  if (display === "hidden") return null;

  const shapeClass =
    display === "square"
      ? "rounded-md"
      : display === "rounded"
        ? "rounded-xl"
        : "rounded-full";

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const dimension = AVATAR_DIMENSIONS[size];

  return (
    <div className={`${AVATAR_SIZE[size]} ${shapeClass} shrink-0 overflow-hidden bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] flex items-center justify-center`}>
      {url ? (
        <Image
          src={url}
          alt={name || "Avatar"}
          width={dimension}
          height={dimension}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-xs font-semibold text-[var(--pb-text-muted)]">{initials}</span>
      )}
    </div>
  );
}

export default function TestimonialCard({
  testimonial,
  config,
  cardSize,
  fullWidth = true,
}: TestimonialCardProps) {
  const {
    style,
    showAvatar,
    avatarDisplay,
    showAuthorName,
    showAuthorTitle,
    showAuthorCompany,
    showAuthorRelationship,
    showContent,
    showRating,
    ratingDisplay,
    showDate,
    dateDisplay,
    showFeaturedBadge,
    accentColor,
  } = config;

  const pad = SIZE_PADDING[cardSize];
  const nameText = NAME_SIZE[cardSize];
  const contentText = CONTENT_SIZE[cardSize];
  const quoteIconSize = QUOTE_SIZE[cardSize];
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
        {showAvatar && (
          <Avatar
            url={testimonial.avatar_url || undefined}
            name={testimonial.author_name}
            display={avatarDisplay}
            size={cardSize}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className={`${nameText} font-medium text-[var(--pb-text-primary)] truncate`}>
            {testimonial.author_name}
          </p>
          {showAuthorTitle && testimonial.author_title && (
            <p className="text-xs text-[var(--pb-text-muted)] truncate">{testimonial.author_title}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {showRating && <StarRating rating={testimonial.rating} display={ratingDisplay} size={cardSize} />}
          {showFeaturedBadge && <FeaturedBadge visible={testimonial.is_featured} />}
        </div>
      </div>
    );
  }

  // ── Minimal ───────────────────────────────────────────────────────────────
  if (style === "minimal") {
    return (
      <div
        className={`${widthClass} ${pad} rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] transition-all hover:border-[var(--pb-foreground-20)]`}
        style={accentStyle}
      >
        <div className="flex items-start gap-3">
          <Quote className={`${quoteIconSize} text-[var(--pb-foreground-20)] shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            {showContent && (
              <MarkdownText className={`${contentText} text-[var(--pb-text-secondary)] leading-relaxed line-clamp-3`}>
                {testimonial.content}
              </MarkdownText>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {showAuthorName && (
                <span className="text-xs font-medium text-[var(--pb-text-primary)]">
                  {testimonial.author_name}
                </span>
              )}
              {showAuthorCompany && testimonial.author_company && (
                <span className="text-xs text-[var(--pb-text-muted)]">{testimonial.author_company}</span>
              )}
              {showRating && <StarRating rating={testimonial.rating} display={ratingDisplay} size={cardSize} />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Featured ───────────────────────────────────────────────────────────────
  if (style === "featured") {
    return (
      <div
        className={`${widthClass} rounded-xl overflow-hidden border border-[var(--pb-border)] bg-[var(--pb-surface)] transition-all hover:border-[var(--pb-foreground-20)] group`}
        style={accentStyle}
      >
        <div className={`${pad} space-y-4`}>
          <div className="flex items-start justify-between">
            <Quote className={`${quoteIconSize} text-[var(--pb-foreground-20)]`} />
            {showFeaturedBadge && <FeaturedBadge visible={testimonial.is_featured} />}
          </div>

          {showContent && (
            <MarkdownText className={`${contentText} text-[var(--pb-text-primary)] leading-relaxed italic`}>
              {testimonial.content}
            </MarkdownText>
          )}

          <div className="flex items-center gap-3 pt-2 border-t border-[var(--pb-border)]">
            {showAvatar && (
              <Avatar
                url={testimonial.avatar_url || undefined}
                name={testimonial.author_name}
                display={avatarDisplay}
                size={cardSize}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {showAuthorName && (
                  <span className={`${nameText} font-semibold text-[var(--pb-text-primary)]`}>
                    {testimonial.author_name}
                  </span>
                )}
                {showRating && <StarRating rating={testimonial.rating} display={ratingDisplay} size={cardSize} />}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {showAuthorTitle && testimonial.author_title && (
                  <span className="text-xs text-[var(--pb-text-muted)]">{testimonial.author_title}</span>
                )}
                {showAuthorCompany && testimonial.author_company && (
                  <span className="text-xs text-[var(--pb-text-muted)]">{testimonial.author_company}</span>
                )}
              </div>
            </div>
          </div>

          {showDate && (
            <p className="text-xs text-[var(--pb-text-muted)]">
              {formatDate(testimonial.created_at, dateDisplay)}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Detailed ───────────────────────────────────────────────────────────────
  if (style === "detailed") {
    return (
      <div
        className={`${widthClass} ${pad} rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)] space-y-3 transition-all hover:border-[var(--pb-foreground-20)]`}
        style={accentStyle}
      >
        <div className="flex items-start gap-3">
          {showAvatar && (
            <Avatar
              url={testimonial.avatar_url || undefined}
              name={testimonial.author_name}
              display={avatarDisplay}
              size={cardSize}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {showAuthorName && (
                <span className={`${nameText} font-semibold text-[var(--pb-text-primary)]`}>
                  {testimonial.author_name}
                </span>
              )}
              {showFeaturedBadge && <FeaturedBadge visible={testimonial.is_featured} />}
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              {showAuthorTitle && testimonial.author_title && (
                <span className="text-xs text-[var(--pb-text-muted)]">{testimonial.author_title}</span>
              )}
              {showAuthorCompany && testimonial.author_company && (
                <span className="text-xs text-[var(--pb-text-muted)]">{testimonial.author_company}</span>
              )}
              {showAuthorRelationship && testimonial.author_relationship && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-[var(--pb-text-muted)]">
                  {testimonial.author_relationship}
                </span>
              )}
            </div>
          </div>
          {showRating && (
            <StarRating rating={testimonial.rating} display={ratingDisplay} size={cardSize} />
          )}
        </div>

        {showContent && (
          <div className="relative">
            <Quote className={`${quoteIconSize} text-[var(--pb-foreground-10)] absolute -top-1 -left-1`} />
            <MarkdownText className={`${contentText} text-[var(--pb-text-secondary)] leading-relaxed pl-4`}>
              {testimonial.content}
            </MarkdownText>
          </div>
        )}

        {showDate && (
          <p className="text-xs text-[var(--pb-text-muted)] pt-1">
            {formatDate(testimonial.created_at, dateDisplay)}
          </p>
        )}
      </div>
    );
  }

  // ── Standard (default) ────────────────────────────────────────────────────
  return (
    <div
      className={`${widthClass} ${pad} rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)] space-y-3 transition-all hover:border-[var(--pb-foreground-20)]`}
      style={accentStyle}
    >
      <div className="flex items-center gap-3">
        {showAvatar && (
          <Avatar
            url={testimonial.avatar_url || undefined}
            name={testimonial.author_name}
            display={avatarDisplay}
            size={cardSize}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {showAuthorName && (
              <span className={`${nameText} font-semibold text-[var(--pb-text-primary)] truncate`}>
                {testimonial.author_name}
              </span>
            )}
            {showFeaturedBadge && <FeaturedBadge visible={testimonial.is_featured} />}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {showAuthorTitle && testimonial.author_title && (
              <span className="text-xs text-[var(--pb-text-muted)]">{testimonial.author_title}</span>
            )}
            {showAuthorCompany && testimonial.author_company && (
              <span className="text-xs text-[var(--pb-text-muted)]">{testimonial.author_company}</span>
            )}
          </div>
        </div>
        {showRating && <StarRating rating={testimonial.rating} display={ratingDisplay} size={cardSize} />}
      </div>

      {showContent && (
        <MarkdownText className={`${contentText} text-[var(--pb-text-secondary)] leading-relaxed line-clamp-4`}>
          {testimonial.content}
        </MarkdownText>
      )}

      {showDate && (
        <p className="text-xs text-[var(--pb-text-muted)]">
          {formatDate(testimonial.created_at, dateDisplay)}
        </p>
      )}
    </div>
  );
}