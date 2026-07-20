"use client";

import { motion } from "framer-motion";
import { FileText, Globe, Clock, Pin, Eye, Heart } from "lucide-react";
import type { ContentWithAuthor } from "@/lib/stores/contents/types/content.types";

interface BlogStatsBarProps {
  blogs: ContentWithAuthor[];
}

export function BlogStatsBar({ blogs }: BlogStatsBarProps) {
  const total = blogs.length;
  const published = blogs.filter((b) => b.status === "PUBLISHED").length;
  const drafts = blogs.filter((b) => b.status === "DRAFT").length;
  const pinned = blogs.filter((b) => b.is_pinned).length;
  const totalViews = blogs.reduce((sum, b) => sum + (b.views_count ?? 0), 0);
  const totalLikes = blogs.reduce((sum, b) => sum + (b.likes_count ?? 0), 0);

  const items = [
    {
      icon: FileText,
      label: "Total",
      value: total,
      color: "var(--accent)",
      bgColor: "var(--accent)/10",
    },
    {
      icon: Globe,
      label: "Published",
      value: published,
      color: "#22c55e",
      bgColor: "rgba(34,197,94,0.1)",
    },
    {
      icon: Clock,
      label: "Drafts",
      value: drafts,
      color: "#f59e0b",
      bgColor: "rgba(245,158,11,0.1)",
    },
    {
      icon: Pin,
      label: "Pinned",
      value: pinned,
      color: "#3b82f6",
      bgColor: "rgba(59,130,246,0.1)",
    },
    // {
    //   icon: Eye,
    //   label: "Total Views",
    //   value: totalViews,
    //   color: "#8b5cf6",
    //   bgColor: "rgba(139,92,246,0.1)",
    // },
    {
      icon: Heart,
      label: "Total Likes",
      value: totalLikes,
      color: "#ec4899",
      bgColor: "rgba(236,72,153,0.1)",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="relative overflow-hidden rounded-2xl border border-[var(--foreground)]/10 
                     bg-[var(--background)] p-4 hover:border-[var(--accent)]/20 transition-colors"
        >
          {/* <div
            className="absolute top-0 right-0 w-16 h-16 rounded-full -translate-y-1/2 translate-x-1/2 opacity-30"
            style={{ backgroundColor: item.color.replace(")", ")").replace("var(--accent)", "var(--accent)") }}
          /> */}
          <div className="relative">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ backgroundColor: item.bgColor }}
            >
              <item.icon className="w-4 h-4" style={{ color: item.color }} />
            </div>
            <p className="text-2xl font-league-700">{item.value.toLocaleString()}</p>
            <p className="text-xs text-[var(--foreground)]/50 mt-0.5">{item.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
