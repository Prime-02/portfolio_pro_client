"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, Shield, Pencil, ArrowRight, X } from "lucide-react";
import type { CollaboratorResponse } from "@/lib/stores/projects/types/project.types";
import Button from "../buttons/Buttons";
import { useState } from "react";
import MarkdownRenderer from "../markdown/MarkdownRenderer";
import Modal from "../containers/modals/Modal";

interface CollaboratorListProps {
  projectId: string;
  collaborators: CollaboratorResponse[];
  isOwner: boolean;
  isLoading: boolean;
  onManage: () => void;
}

export function CollaboratorList({
  projectId,
  collaborators,
  isOwner,
  isLoading,
  onManage,
}: CollaboratorListProps) {
  const [selectedCollaborator, setSelectedCollaborator] = useState<CollaboratorResponse | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-[var(--foreground)]/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[var(--foreground)]/40 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4" />
          Team ({collaborators.length})
        </h3>
        {isOwner && (
          <div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onManage}
              icon={<ArrowRight className="w-4 h-4" />}
              text="Manage"
            />
          </div>
        )}
      </div>

      {/* Collaborator cards */}
      <div className="flex flex-col gap-3">
        {collaborators.map((collaborator, i) => (
          <motion.div
            key={collaborator.user_id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`flex items-center gap-3 p-4 rounded-xl border border-[var(--foreground)]/10 
              bg-[var(--background)] hover:border-[var(--accent)]/20 transition-colors cursor-pointer
              ${selectedCollaborator?.user_id === collaborator.user_id ? 'border-[var(--accent)]/30 ring-1 ring-[var(--accent)]/20' : ''}`}
            onClick={() => setSelectedCollaborator(collaborator)}
          >
            {collaborator.profile_picture ? (
              <img
                src={collaborator.profile_picture}
                alt={collaborator.username || `Profile picture of Collaborator ${i}`}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-[var(--accent)]">
                  {collaborator.username?.[0]?.toUpperCase() ?? "?"}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">
                  {collaborator.username ?? "Unknown"}
                </span>
                {collaborator.can_edit && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium
                    bg-[var(--accent)]/10 text-[var(--accent)]">
                    <Pencil className="w-2.5 h-2.5" />
                    Can Edit
                  </span>
                )}
              </div>
              <span className="text-xs text-[var(--foreground)]/40 capitalize">
                {collaborator.role}
              </span>
              {collaborator.contribution_description && (
                <p className="text-xs text-[var(--foreground)]/40 mt-1 line-clamp-1">
                  {collaborator.contribution_description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={selectedCollaborator !== null}
        onClose={() => setSelectedCollaborator(null)}
        size="lg"
        title={
          <div>

            <div className="flex items-center gap-3">
              {selectedCollaborator?.profile_picture ? (
                <img
                  src={selectedCollaborator?.profile_picture}
                  alt={selectedCollaborator?.username || "Profile picture"}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                  <span className="text-lg font-medium text-[var(--accent)]">
                    {selectedCollaborator?.username?.[0]?.toUpperCase() ?? "?"}
                  </span>
                </div>
              )}
              <div>
                <h4 className="font-medium text-lg">
                  {selectedCollaborator?.username ?? "Unknown"}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[var(--foreground)]/40 capitalize">
                    {selectedCollaborator?.role}
                  </span>
                  {selectedCollaborator?.can_edit && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium
                          bg-[var(--accent)]/10 text-[var(--accent)]">
                      <Pencil className="w-2.5 h-2.5" />
                      Can Edit
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        }
      >
        <div className="flex items-start justify-between mb-4">
          {/* Contribution Description */}
          {selectedCollaborator?.contribution_description ? (
            <div className="mt-2">
              <h5 className="text-xs font-medium text-[var(--foreground)]/40 uppercase tracking-wider mb-2">
                Contribution
              </h5>
              <MarkdownRenderer markdown={selectedCollaborator?.contribution_description} />
            </div>
          ) : (
            <p className="text-sm text-[var(--foreground)]/30 italic">
              No contribution description provided.
            </p>
          )}
        </div>
      </Modal>
      {collaborators.length === 0 && (
        <div className="text-center py-8 text-[var(--foreground)]/30 text-sm">
          No collaborators yet. {isOwner && "Add team members to collaborate on this project."}
        </div>
      )}
    </div>
  );
}