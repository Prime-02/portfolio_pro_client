"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Eye,
  Lock,
  Globe,
  Clock,
  Pin,
  Star,
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ContentWithAuthor, ContentStatus } from "@/lib/stores/contents/types/content.types";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { useUIStore } from "@/lib/stores/ui/useUIStore";
import Link from "next/link";

interface BlogCardProps {
  blog: ContentWithAuthor;
  index: number;
  isOwner: boolean;
  featured?: boolean;
  onEdit?: (blog: ContentWithAuthor) => void;
  onDelete?: (blog: ContentWithAuthor) => void;
}

const STATUS_CONFIG: Record<ContentStatus, { label: string; color: string; bg: string }> = {
  PUBLISHED: { label: "Published", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  DRAFT: { label: "Draft", color: "text-amber-500", bg: "bg-amber-500/10" },
  ARCHIVED: { label: "Archived", color: "text-[var(--foreground)]/40", bg: "bg-[var(--foreground)]/5" },
  SCHEDULED: { label: "Scheduled", color: "text-blue-500", bg: "bg-blue-500/10" },
  DELETED: { label: "Deleted", color: "text-red-500", bg: "bg-red-500/10" },
};

export function BlogCard({
  blog,
  index,
  isOwner,
  featured = false,
  onEdit,
  onDelete,
}: BlogCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { userInfo } = useUserSettings()
  const router = useRouter();
  const { isDesktop } = useUIStore()

  const hasCover = blog.cover_image_url;
  const isPublic = blog.is_public;
  const status = blog.status;
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  const isOwn = blog.user_id === userInfo?.id || false
  const isPost = blog.content_type === "POST"

  const readTime = blog.body ? Math.ceil(blog.body.split(/\s+/).length / 200) : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`blogs/${blog.slug}`)}
      className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer h-fit
        ${featured
          ? "border-[var(--accent)]/20 bg-[var(--accent)]/5 md:col-span-2 lg:col-span-2"
          : "border-[var(--foreground)]/10 bg-[var(--background)]"
        }
        hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-[var(--accent)]/5`}
    >
      {/* Cover Image */}
      {hasCover && (
        <div className={`relative overflow-hidden ${featured ? "h-52 md:h-64" : "h-44"}`}>
          <img
            src={blog.cover_image_url!}
            alt={blog.title || "Blog cover"}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={featured
              ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              : "(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />

          {/* Status badge */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium
              ${statusConfig.bg} ${statusConfig.color}`}>
              <Clock className="w-3 h-3" />
              {statusConfig.label}
            </span>
            {blog.is_pinned && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium
                bg-[var(--accent)]/10 text-[var(--accent)]">
                <Pin className="w-3 h-3" />
                Pinned
              </span>
            )}
            {blog.is_featured && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium
                bg-amber-500/10 text-amber-500">
                <Star className="w-3 h-3" />
                Featured
              </span>
            )}
          </div>

          {/* Privacy badge */}
          {!isPublic && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium
                bg-[var(--foreground)]/10 text-[var(--foreground)]/50">
                <Lock className="w-3 h-3" />
                Private
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {
              !isPost &&
              <h3 className={`font-league-600 leading-tight ${featured ? "text-xl" : "text-base"} truncate`}>
                {blog.title}
              </h3>
            }
            <Link
              href={`/${blog.author?.username}`}
              className="flex items-center gap-2 mt-1.5">
              {blog.author && (
                <span className="flex items-center gap-1.5 text-xs text-[var(--foreground)]/50">
                  {blog.author.profile_picture ? (
                    <img
                      src={blog.author.profile_picture}
                      alt={blog.author.username || "Author avatar"}
                      width={16}
                      height={16}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                      <span className="text-[8px] font-medium text-[var(--accent)]">{blog.author.username[0]?.toUpperCase()}</span>
                    </div>
                  )}
                  {blog.author.username}
                </span>
              )}
              {blog.category && (
                <>
                  <span className="text-[var(--foreground)]/20">·</span>
                  <span className="text-xs text-[var(--foreground)]/40">{blog.category}</span>
                </>
              )}
            </Link>
          </div>
        </div>

        {/* Excerpt */}
        {blog.excerpt && (
          <p className={`mt-3 text-[var(--foreground)]/50 ${featured ? "text-sm line-clamp-3" : "text-xs line-clamp-2"}`}>
            {blog.excerpt}
          </p>
        )}

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {blog.tags.slice(0, featured ? 5 : 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium
                  bg-[var(--foreground)]/5 text-[var(--foreground)]/40
                  border border-[var(--foreground)]/5"
              >
                {tag}
              </span>
            ))}
            {blog.tags.length > (featured ? 5 : 3) && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium text-[var(--foreground)]/30">
                +{blog.tags.length - (featured ? 5 : 3)}
              </span>
            )}
          </div>
        )}

        {/* Footer meta */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--foreground)]/5">
          <div className="flex items-center gap-3 text-[var(--foreground)]/40">
            <span className="flex items-center gap-1 text-xs">
              <Heart className="w-3.5 h-3.5" />
              {blog.likes_count ?? 0}
            </span>
            <span className="flex items-center gap-1 text-xs">
              <MessageCircle className="w-3.5 h-3.5" />
              {blog.comments_count ?? 0}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[var(--foreground)]/30">
            {readTime > 0 && (
              <span className="text-[10px]">{readTime} min read</span>
            )}
            {blog.published_at && (
              <span className="flex items-center gap-1 text-[10px]">
                <Calendar className="w-3 h-3" />
                {new Date(blog.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
          </div>
        </div>

        {/* Owner actions */}
        {isOwner && (
          <motion.div
            initial={isDesktop ? { opacity: 0, y: 4 } : { opacity: 1, y: 0 }}
            animate={{ opacity: !isDesktop || isHovered ? 1 : 0, y: !isDesktop || isHovered ? 0 : 4 }}
            transition={{ duration: 0.2 }}
            className="flex gap-1 mt-3 pt-3 border-t border-[var(--foreground)]/5"
          >
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(blog); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg
                text-xs font-medium hover:bg-[var(--foreground)]/5 transition-colors"
            >
              <Pencil className="w-3 h-3" />
              Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(blog); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg
                text-xs font-medium text-red-500 hover:bg-red-500/5 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Remove
            </button>
          </motion.div>
        )}
      </div>
    </motion.article>
  );
}