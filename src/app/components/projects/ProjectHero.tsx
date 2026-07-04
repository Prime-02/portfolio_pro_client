"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Eye,
  ExternalLink,
  Lock,
  Globe,
  CheckCircle2,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { PortfolioProjectResponse } from "@/lib/stores/projects/types/project.types";
import type { FullProjectEngagement } from "@/lib/stores/projects/types/project.types";
import { useProjectEngagementStore } from "@/lib/stores/projects/useProjectEngagementStore";
import MarkdownRenderer from "../markdown/MarkdownRenderer";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { toast } from "../toastify/Toastify";

interface ProjectHeroProps {
  project: PortfolioProjectResponse;
  engagement?: FullProjectEngagement;
  isOwner: boolean;
}

export function ProjectHero({ project, engagement }: ProjectHeroProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const { toggleLike, userLikedByProject, loading } = useProjectEngagementStore();
  const { userInfo } = useUserSettings();

  // Memoize media slots to prevent recalculation and ensure they're keyed by project id
  const mediaSlots = useMemo(() => {
    const slots = [
      project.other_project_image_url?.hero_media,
      project.other_project_image_url?.media_1,
      project.other_project_image_url?.media_2,
      project.other_project_image_url?.media_3,
    ].filter((media) => media?.url); // Filter for media objects that have a url property

    return slots;
  }, [project.id, project.other_project_image_url]);

  // Reset activeMediaIndex when project changes or media slots change
  useEffect(() => {
    setActiveMediaIndex(0);
  }, [project.id]);

  // Safety check: if activeMediaIndex is out of bounds, reset to 0
  useEffect(() => {
    if (mediaSlots.length > 0 && activeMediaIndex >= mediaSlots.length) {
      setActiveMediaIndex(0);
    }
  }, [mediaSlots.length, activeMediaIndex]);

  const hasLiked = userLikedByProject[project.id] ?? engagement?.user_has_liked ?? false;
  const likesCount = engagement?.statistics?.likes_count ?? project.likes_count ?? 0;
  const commentsCount = engagement?.statistics?.comments_count ?? project.comments_count ?? 0;

  const handleLike = async () => {
    if (!userInfo?.username) {
      toast.warning("You must be logged in to like projects");
      return;
    }
    await toggleLike(project.id);
  };

  const statusConfig = {
    completed: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Completed" },
    concept: { icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10", label: "Concept" },
    active: { icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10", label: "Active" },
  };

  const status = project.is_concept ? "concept" : project.is_completed ? "completed" : "active";
  const StatusIcon = statusConfig[status].icon;

  // Safely get the current active media
  const currentMedia = mediaSlots[activeMediaIndex];

  return (
    <div className="space-y-6">
      {/* Media Gallery */}
      {mediaSlots.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden border border-[var(--foreground)]/10">
          <div className="relative aspect-video bg-[var(--foreground)]/5">
            <AnimatePresence mode="wait">
              {currentMedia?.url && (
                <motion.img
                  key={`${project.id}-${activeMediaIndex}`}
                  src={currentMedia.url}
                  alt={`${project.project_name} - ${activeMediaIndex + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Optional: Handle broken images
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
            </AnimatePresence>

            {/* Navigation arrows */}
            {mediaSlots.length > 1 && (
              <>
                <button
                  onClick={() => setActiveMediaIndex((i) => (i === 0 ? mediaSlots.length - 1 : i - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[var(--background)]/80 
                    backdrop-blur-sm hover:bg-[var(--background)] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveMediaIndex((i) => (i === mediaSlots.length - 1 ? 0 : i + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[var(--background)]/80 
                    backdrop-blur-sm hover:bg-[var(--background)] transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Thumbnail strip */}
            {mediaSlots.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {mediaSlots.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveMediaIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === activeMediaIndex
                      ? "bg-[var(--accent)] w-6"
                      : "bg-[var(--background)]/60 hover:bg-[var(--background)]"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Title & Actions Row */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-league-700">{project.project_name}</h1>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium
              ${statusConfig[status].bg} ${statusConfig[status].color}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {statusConfig[status].label}
            </span>
            {!project.is_public && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium
                bg-[var(--foreground)]/10 text-[var(--foreground)]/50"
              >
                <Lock className="w-3.5 h-3.5" />
                Private
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-[var(--foreground)]/50">
            <span>{project.project_platform}</span>
            {project.project_category && (
              <>
                <span className="text-[var(--foreground)]/20">·</span>
                <span>{project.project_category}</span>
              </>
            )}
            {project.project_url && (
              <>
                <span className="text-[var(--foreground)]/20">·</span>
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Visit
                </a>
              </>
            )}
          </div>
        </div>

        {/* Engagement Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            disabled={loading.toggleLike}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all
              ${hasLiked
                ? "border-red-500/30 bg-red-500/10 text-red-500"
                : "border-[var(--foreground)]/10 hover:border-red-500/30 hover:bg-red-500/5"
              }`}
          >
            <Heart className={`w-5 h-5 ${hasLiked ? "fill-current" : ""}`} />
            <span className="text-sm font-medium">{likesCount}</span>
          </button>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--foreground)]/10">
            <MessageCircle className="w-5 h-5 text-[var(--foreground)]/40" />
            <span className="text-sm font-medium">{commentsCount}</span>
          </div>
        </div>
      </div>


      {/* Summary */}
      {project.project_summary && (
        <p className="text-sm text-[var(--foreground)]/50 line-clamp-2">
          {project.project_summary}
        </p>
      )}


      {/* Full Description */}
      {project.project_description && (
        <MarkdownRenderer markdown={project.project_description} />
      )}
    </div>
  );
}