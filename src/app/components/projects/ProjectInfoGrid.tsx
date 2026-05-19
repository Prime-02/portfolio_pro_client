"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  DollarSign,
  Building2,
  Tag,
  Layers,
  Link2,
  Clock,
  CheckCircle2,
} from "lucide-react";
import type { PortfolioProjectResponse } from "@/lib/stores/projects/types/project.types";
import MarkdownRenderer from "../markdown/MarkdownRenderer";

interface ProjectInfoGridProps {
  project: PortfolioProjectResponse;
}

export function ProjectInfoGrid({ project }: ProjectInfoGridProps) {
  const infoItems = [
    {
      icon: Calendar,
      label: "Timeline",
      value: project.start_date
        ? `${new Date(project.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })} — ${project.end_date
          ? new Date(project.end_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
          : "Present"
        }`
        : null,
    },
    {
      icon: DollarSign,
      label: "Budget",
      value: project.budget ? `$${project.budget.toLocaleString()}` : null,
    },
    {
      icon: Building2,
      label: "Client",
      value: project.client_name,
    },
    {
      icon: Clock,
      label: "Status",
      value: project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : null,
    },
    {
      icon: Link2,
      label: "Links",
      value: project.other_project_url
        ? Object.entries(project.other_project_url).map(([k, v]) => `${k}: ${v}`).join(", ")
        : null,
      isList: true,
    },
    {
      icon: CheckCircle2,
      label: "Featured In",
      value: project.featured_in?.length ? project.featured_in.join(", ") : null,
    },
  ].filter((item) => item.value);

  return (
    <div className="space-y-8">
      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {infoItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="p-4 rounded-xl border border-[var(--foreground)]/10 bg-[var(--background)]"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                <item.icon className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <span className="text-xs font-medium text-[var(--foreground)]/40 uppercase tracking-wider">
                {item.label}
              </span>
            </div>
            <p className="text-sm text-[var(--foreground)]/70 mt-1">
              {item.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Stack Section */}
      {project.stack && project.stack.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-medium text-[var(--foreground)]/40 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Tech Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 rounded-lg text-sm font-medium
                  bg-[var(--accent)]/10 text-[var(--accent)]/80
                  border border-[var(--accent)]/20"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tags Section */}
      {project.tags && project.tags.length > 0 && (
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
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full text-xs
                  bg-[var(--foreground)]/5 text-[var(--foreground)]/50
                  border border-[var(--foreground)]/10"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Contribution Description */}
      {project.user_associations?.[0]?.contribution_description && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-5 rounded-xl border border-[var(--accent)]/10 bg-[var(--accent)]/5"
        >
          <h3 className="text-sm font-medium text-[var(--accent)] mb-2">My Contribution</h3>
          <MarkdownRenderer markdown={project.user_associations[0].contribution_description} />
        </motion.div>
      )}
    </div>
  );
}
