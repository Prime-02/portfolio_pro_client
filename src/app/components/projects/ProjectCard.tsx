"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  ExternalLink,
  Lock,
  Globe,
  CheckCircle2,
  Lightbulb,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  Calendar,
  Layers,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { PortfolioProjectResponse } from "@/lib/stores/projects/types/project.types";

interface ProjectCardProps {
  project: PortfolioProjectResponse;
  index: number;
  isOwner: boolean;
  featured?: boolean;
  onEdit?: (project: PortfolioProjectResponse) => void;
  onDelete?: (project: PortfolioProjectResponse) => void;
}

export function ProjectCard({
  project,
  index,
  isOwner,
  featured = false,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const hasHeroMedia = project.other_project_image_url?.hero_media?.url;
  const isPublic = project.is_public;
  const isCompleted = project.is_completed;
  const isConcept = project.is_concept;

  const statusConfig = {
    completed: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    concept: { icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10" },
    active: { icon: Layers, color: "text-blue-500", bg: "bg-blue-500/10" },
  };

  const status = isConcept ? "concept" : isCompleted ? "completed" : "active";
  const StatusIcon = statusConfig[status].icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`projects/${project.id}`)}
      className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer
        ${featured 
          ? "border-[var(--accent)]/20 bg-[var(--accent)]/5 md:col-span-2 lg:col-span-2" 
          : "border-[var(--foreground)]/10 bg-[var(--background)]"
        }
        hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-[var(--accent)]/5`}
    >
      {/* Media section */}
      {hasHeroMedia && (
        <div className={`relative overflow-hidden ${featured ? "h-48 md:h-56" : "h-40"}`}>
          <img
            src={project.other_project_image_url!.hero_media!.url}
            alt={project.project_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium
              ${statusConfig[status].bg} ${statusConfig[status].color}`}>
              <StatusIcon className="w-3 h-3" />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
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
            <h3 className={`font-league-600 leading-tight truncate ${featured ? "text-lg" : "text-base"}`}>
              {project.project_name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[var(--foreground)]/50">
                {project.project_platform}
              </span>
              {project.project_category && (
                <>
                  <span className="text-[var(--foreground)]/20">·</span>
                  <span className="text-xs text-[var(--foreground)]/40">
                    {project.project_category}
                  </span>
                </>
              )}
            </div>
          </div>

          {project.project_url && (
            <a
              href={project.project_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-[var(--foreground)]/5 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-[var(--foreground)]/30" />
            </a>
          )}
        </div>

        {/* Description */}
        {project.project_description && (
          <p className={`mt-2 text-[var(--foreground)]/50 ${featured ? "text-sm line-clamp-3" : "text-xs line-clamp-2"}`}>
            {project.project_description}
          </p>
        )}

        {/* Stack tags */}
        {project.stack && project.stack.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {project.stack.slice(0, featured ? 6 : 3).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium
                  bg-[var(--foreground)]/5 text-[var(--foreground)]/40
                  border border-[var(--foreground)]/5"
              >
                {tech}
              </span>
            ))}
            {project.stack.length > (featured ? 6 : 3) && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium text-[var(--foreground)]/30">
                +{project.stack.length - (featured ? 6 : 3)}
              </span>
            )}
          </div>
        )}

        {/* Footer meta */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--foreground)]/5">
          <div className="flex items-center gap-3 text-[var(--foreground)]/40">
            <span className="flex items-center gap-1 text-xs">
              <Heart className="w-3.5 h-3.5" />
              {project.likes_count ?? 0}
            </span>
            <span className="flex items-center gap-1 text-xs">
              <MessageCircle className="w-3.5 h-3.5" />
              {project.comments_count ?? 0}
            </span>
            <span className="flex items-center gap-1 text-xs">
              <Users className="w-3.5 h-3.5" />
              {project.user_associations?.length ?? 1}
            </span>
          </div>

          {project.start_date && (
            <span className="flex items-center gap-1 text-[10px] text-[var(--foreground)]/30">
              <Calendar className="w-3 h-3" />
              {new Date(project.start_date).getFullYear()}
            </span>
          )}
        </div>

        {/* Owner actions */}
        {isOwner && (
          <motion.div
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 4 }}
            className="flex gap-1 mt-3 pt-3 border-t border-[var(--foreground)]/5"
          >
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(project); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg
                text-xs font-medium hover:bg-[var(--foreground)]/5 transition-colors"
            >
              <Pencil className="w-3 h-3" />
              Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(project); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg
                text-xs font-medium text-red-500 hover:bg-red-500/5 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Remove
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
