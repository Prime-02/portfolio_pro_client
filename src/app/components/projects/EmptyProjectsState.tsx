"use client";

import { motion } from "framer-motion";
import { FolderOpen, Plus, Code2, Palette, Globe, Cpu, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "../buttons/Buttons";

interface EmptyProjectsStateProps {
  isOwner: boolean;
  username?: string;
}

const EXAMPLE_PROJECTS = [
  "E-commerce Platform",
  "AI Dashboard",
  "Mobile Fitness App",
  "Design System",
  "API Gateway",
  "Blockchain Explorer",
];

const CATEGORY_ICONS = [
  <Code2 key="code" className="w-5 h-5" />,
  <Palette key="design" className="w-5 h-5" />,
  <Globe key="web" className="w-5 h-5" />,
  <Cpu key="ai" className="w-5 h-5" />,
  <Smartphone key="mobile" className="w-5 h-5" />,
];

export function EmptyProjectsState({ isOwner, username }: EmptyProjectsStateProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="relative p-5 rounded-2xl bg-[var(--accent)]/10 mb-6">
        <FolderOpen className="w-12 h-12 text-[var(--accent)]" />
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--accent)]/20 flex items-center justify-center"
        >
          <Plus className="w-3 h-3 text-[var(--accent)]" />
        </motion.div>
      </div>

      <h2 className="text-2xl font-league-600 mb-2">
        {isOwner ? "No projects yet" : "Nothing to showcase"}
      </h2>
      <p className="text-[var(--foreground)]/60 text-center max-w-sm mb-8">
        {isOwner
          ? "Build your portfolio — add the projects that define your craft and creativity."
          : `${username || "This user"} hasn't added any projects yet.`}
      </p>

      {isOwner && (
        <Button
          onClick={() => router.push("projects/create")}
          size="lg"
          icon={<Plus className="w-5 h-5" />}
          text="Add Your First Project"
        />
      )}

      {isOwner && (
        <div className="mt-12 flex flex-wrap justify-center gap-3 max-w-lg">
          {EXAMPLE_PROJECTS.map((project, i) => (
            <motion.div
              key={project}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--foreground)]/5
                         border border-[var(--foreground)]/5 text-sm text-[var(--foreground)]/50"
            >
              {CATEGORY_ICONS[i % CATEGORY_ICONS.length]}
              {project}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
