"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectCard } from "./ProjectCard";
import type { PortfolioProjectResponse } from "@/lib/stores/projects/types/project.types";

interface ProjectGridProps {
  projects: PortfolioProjectResponse[];
  isLoading: boolean;
  isOwner: boolean;
  onEdit: (project: PortfolioProjectResponse) => void;
  onDelete: (project: PortfolioProjectResponse) => void;
}

export function ProjectGrid({ projects, isLoading, isOwner, onEdit, onDelete }: ProjectGridProps) {
  // Sort: featured first, then by date
  const sorted = useMemo(() => {
    return [...projects].sort((a, b) => {
      // You could add a is_featured field later; for now sort by date
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [projects]);
  if (isLoading) return null; // Handled by parent skeleton


  // First project as featured if it has media
  const featuredProject = sorted.find((p) => p.other_project_image_url?.hero_media?.url);
  const regularProjects = sorted.filter((p) => p.id !== featuredProject?.id);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
      <AnimatePresence mode="popLayout">
        {featuredProject && (
          <ProjectCard
            key={featuredProject.id}
            project={featuredProject}
            index={0}
            isOwner={isOwner}
            featured={true}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}

        {regularProjects.map((project, idx) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={idx + 1}
            isOwner={isOwner}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
