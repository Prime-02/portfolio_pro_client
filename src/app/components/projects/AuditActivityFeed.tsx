"use client";

import { motion } from "framer-motion";
import {
  GitCommit,
  UserPlus,
  Heart,
  MessageCircle,
  Edit3,
  Trash2,
  Eye,
  Clock,
} from "lucide-react";
import type { ProjectAudit } from "@/lib/stores/projects/types/project.types";

interface AuditActivityFeedProps {
  logs: ProjectAudit[];
  isLoading: boolean;
}

const ACTION_ICONS: Record<string, typeof GitCommit> = {
  create: GitCommit,
  update: Edit3,
  delete: Trash2,
  view: Eye,
  like: Heart,
  comment: MessageCircle,
  add_collaborator: UserPlus,
  remove_collaborator: UserPlus,
  default: GitCommit,
};

const ACTION_COLORS: Record<string, string> = {
  create: "text-emerald-500",
  update: "text-blue-500",
  delete: "text-red-500",
  view: "text-[var(--foreground)]/30",
  like: "text-red-400",
  comment: "text-purple-500",
  add_collaborator: "text-cyan-500",
  remove_collaborator: "text-orange-500",
};

const ACTION_BG: Record<string, string> = {
  create: "bg-emerald-500/10",
  update: "bg-blue-500/10",
  delete: "bg-red-500/10",
  view: "bg-[var(--foreground)]/5",
  like: "bg-red-400/10",
  comment: "bg-purple-500/10",
  add_collaborator: "bg-cyan-500/10",
  remove_collaborator: "bg-orange-500/10",
};

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function AuditActivityFeed({ logs, isLoading }: AuditActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-[var(--foreground)]/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-10 text-[var(--foreground)]/30 text-sm">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {logs.map((log, i) => {
        const actionKey = log.action.toLowerCase().split("_")[0];
        const Icon = ACTION_ICONS[actionKey] || ACTION_ICONS.default;
        const colorClass = ACTION_COLORS[actionKey] || ACTION_COLORS.default;
        const bgClass = ACTION_BG[actionKey] || ACTION_BG.default;

        return (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--foreground)]/5 transition-colors"
          >
            <div className={`w-9 h-9 rounded-lg ${bgClass} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${colorClass}`} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--foreground)]/70">
                <span className="font-medium capitalize">{log.action.replace(/_/g, " ")}</span>
                {log.details && Object.keys(log.details).length > 0 && (
                  <span className="text-[var(--foreground)]/40">
                    {" "}— {JSON.stringify(log.details).slice(0, 60)}
                    {JSON.stringify(log.details).length > 60 ? "..." : ""}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-[var(--foreground)]/30 flex-shrink-0">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(log.created_at)}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
