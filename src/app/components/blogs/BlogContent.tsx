"use client";

import { motion } from "framer-motion";
import { Tag, FolderOpen, Calendar, Edit3 } from "lucide-react";
import type { ContentWithAuthor } from "@/lib/stores/contents/types/content.types";
import MarkdownRenderer from "../markdown/MarkdownRenderer";

interface BlogContentProps {
  blog: ContentWithAuthor;
  isPost: boolean
}

export function BlogContent({ blog, isPost }: BlogContentProps) {
  return (
    <div className="space-y-8">
      {/* Excerpt */}
      {blog.excerpt && !isPost && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 border-l-4 border-[var(--accent)]/30 bg-[var(--accent)]/5"
        >
          <p className="text-sm text-[var(--foreground)]/60 italic leading-relaxed">
            {blog.excerpt}
          </p>
        </motion.div>
      )}

      {/* Body */}
      {blog.body && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert max-w-none"
        >
          {
            isPost ? <p>
              {blog.body}
            </p> :
              <MarkdownRenderer markdown={blog.body} />
          }
          {blog.tags && blog.tags.length > 0 && isPost && (
            <span className="flex flex-wrap gap-2">
              {
                blog.tags.map((tag, i) => (
                  <p key={i}>
                    #{tag}
                  </p>
                ))
              }
            </span>
          )

          }
        </motion.div>
      )}

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && !isPost && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-medium text-[var(--foreground)]/40 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full text-xs
                  bg-[var(--foreground)]/5 text-[var(--foreground)]/50
                  border border-[var(--foreground)]/10 hover:border-[var(--accent)]/30
                  hover:text-[var(--accent)] transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Category */}
      {blog.category && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center gap-2"
        >
          <FolderOpen className="w-4 h-4 text-[var(--foreground)]/40" />
          <span className="text-sm text-[var(--foreground)]/50">Category:</span>
          <span className="text-sm font-medium text-[var(--accent)]">{blog.category}</span>
        </motion.div>
      )}

      {/* Meta footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="pt-6 border-t border-[var(--foreground)]/10 flex flex-wrap items-center gap-4 text-xs text-[var(--foreground)]/30"
      >
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Created {new Date(blog.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
        {blog.updated_at && blog.updated_at !== blog.created_at && (
          <span className="flex items-center gap-1">
            <Edit3 className="w-3 h-3" />
            Updated {new Date(blog.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        )}
      </motion.div>
    </div>
  );
}
