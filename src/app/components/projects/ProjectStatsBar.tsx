"use client";

import { motion } from "framer-motion";
import { Folder, Globe, CheckCircle2, Lightbulb } from "lucide-react";
import type { ProjectStats } from "@/lib/stores/projects/types/project.types";

interface ProjectStatsBarProps {
  stats: ProjectStats | null;
  totalProjects: number;
}

export function ProjectStatsBar({ stats, totalProjects }: ProjectStatsBarProps) {
  if (!stats) return null;

  const items = [
    {
      icon: Folder,
      label: "Total",
      value: stats.total_projects ?? totalProjects ?? 0,
      color: "var(--accent)",
      bgColor: "var(--accent)/10",
    },
    {
      icon: Globe,
      label: "Public",
      value: stats.public_projects ?? 0,
      color: "#3b82f6",
      bgColor: "rgba(59,130,246,0.1)",
    },
    {
      icon: CheckCircle2,
      label: "Completed",
      value: stats.completed_projects ?? 0,
      color: "#22c55e",
      bgColor: "rgba(34,197,94,0.1)",
    },
    {
      icon: Lightbulb,
      label: "Concepts",
      value: stats.concept_projects ?? 0,
      color: "#f59e0b",
      bgColor: "rgba(245,158,11,0.1)",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="relative overflow-hidden rounded-2xl border border-[var(--foreground)]/10 
                     bg-[var(--background)] p-4 hover:border-[var(--accent)]/20 transition-colors"
        >
          <div
            className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-1/2 translate-x-1/2 opacity-30"
            style={{ backgroundColor: item.color.replace(")", ")").replace("var(--accent)", "var(--accent)") }}
          />
          <div className="relative">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ backgroundColor: item.bgColor }}
            >
              <item.icon className="w-4 h-4" style={{ color: item.color }} />
            </div>
            <p className="text-2xl font-league-700">{item.value}</p>
            <p className="text-xs text-[var(--foreground)]/50 mt-0.5">{item.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
