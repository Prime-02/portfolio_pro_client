"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Edit, Flag, MoreVertical, Sparkles, Trash2 } from "lucide-react";
import type { ProjectWithAuthor } from "@/lib/stores/projects/types/project.types";
import ProjectReactionBar from "./ProjectReactionBar";
import ProjectCommentsSection from "./ProjectCommentsSection";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { useProjectEngagementStore } from "@/lib/stores/projects/useProjectEngagementStore";
import { useProjectStore } from "@/lib/stores/projects/useProjectsStore";
import CloseButton from "../../../buttons/CloseButton";
import Button from "../../../buttons/Buttons";
import ConfirmationModal from "../../../containers/modals/ConfirmationModal";
import { useRouting } from "@/lib/hooks/routing/useRouting";

interface ProjectCardProps {
  project: ProjectWithAuthor;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { userInfo } = useUserSettings();
  const [showComments, setShowComments] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const fetchProjectComments = useProjectEngagementStore((s) => s.fetchProjectComments);

  const toggleComments = useCallback(async () => {
    if (!showComments) {
      setIsLoadingComments(true);
      try {
        await fetchProjectComments(project.id, { page: 1, size: 20 });
      } catch {
        // Error handled by store
      } finally {
        setIsLoadingComments(false);
      }
    }
    setShowComments((prev) => !prev);
  }, [showComments, project.id, fetchProjectComments]);

  const author = project.author;
  const isOwn = author?.id === userInfo?.id;

  const primaryImage =
    project.other_project_image_url?.hero_media?.url ||
    project.project_image_url;

  return (
    <>
      <article
        className="rounded-2xl border border-[var(--foreground)]/10 p-5 transition-shadow hover:shadow-md"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* Author Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 flex items-center justify-center overflow-hidden">
              {author?.profile_picture ? (
                <img
                  src={author.profile_picture}
                  alt={author.display_name || author.username || ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-[var(--accent)]">
                  {(author?.display_name || author?.username || "U").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-sm text-[var(--foreground)]">
                {author?.display_name || author?.username || "Not Set"}
              </p>
              <p className="text-xs text-[var(--foreground)]/50">
                {project.created_at
                  ? formatDistanceToNow(new Date(project.created_at), { addSuffix: true })
                  : "Recently"}
                {project.project_platform && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-[var(--accent)]/10 text-[var(--accent)]">
                    {project.project_platform}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Actions */}
          {isOwn ? (
            <ProjectAuthorActions
              username={userInfo?.username || ""}
              projectId={project.id}
            />
          ) : (
            <button
              className="p-2 rounded-full hover:bg-[var(--foreground)]/5 transition-colors text-[var(--foreground)]/40 hover:text-red-500"
              title="Report content"
            >
              <Flag size={16} />
            </button>
          )}
        </div>

        {/* Project Body */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            {project.project_name}
          </h3>

          {project.project_summary && (
            <p className="text-[var(--foreground)]/80 leading-relaxed mb-3">
              {project.project_summary}
            </p>
          )}
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline"
          >
            View Project
            <Sparkles size={14} />
          </Link>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Stack */}
          {project.stack && project.stack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--foreground)]/5 text-[var(--foreground)]/50"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Cover Image */}
        {primaryImage && (
          <div className="mb-4 rounded-xl overflow-hidden">
            <img
              src={primaryImage}
              alt={project.project_name}
              className="w-full h-auto max-h-80 object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Status badges */}
        <div className="flex items-center gap-2 mb-3">
          {project.is_completed && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-600 font-medium">
              Completed
            </span>
          )}
          {project.is_concept && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/10 text-purple-600 font-medium">
              Concept
            </span>
          )}
          {project.status && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-600 font-medium capitalize">
              {project.status}
            </span>
          )}
        </div>

        <ProjectReactionBar
          project={project}
          showComments={showComments}
          isLoadingComments={isLoadingComments}
          onToggleComments={toggleComments}
        />

        {/* Comments Section */}
        {showComments && (
          <ProjectCommentsSection
            projectId={project.id}
            isLoading={isLoadingComments}
          />
        )}
      </article>
    </>
  );
}

const ProjectAuthorActions = ({
  username,
  projectId,
}: {
  username: string;
  projectId: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteProject, setDeleteProject] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { router } = useRouting();
  const { deleteProjects } = useProjectStore();

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      await deleteProjects({ project_ids: [projectId] });
    } finally {
      setIsDeleting(false);
      setDeleteProject(false);
    }
  };

  return (
    <>
      <div className="relative">
        {isOpen ? (
          <CloseButton onClick={() => setIsOpen(false)} />
        ) : (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-[var(--background)]/20 rounded"
            aria-label="Open menu"
          >
            <MoreVertical size={20} className="text-[var(--foreground)]/60" />
          </button>
        )}

        {isOpen && (
          <div className="absolute right-0 mt-2 bg-[var(--background)] shadow-lg rounded-md border flex flex-col min-w-[150px] z-10">
            <Button
              variant="ghost"
              text="Edit"
              onClick={() => {
                router.push(`/${username}/projects/${projectId}/edit`);
              }}
              className="flex items-center justify-end"
              size="sm"
            />
            <Button
              variant="ghost"
              text="Delete"
              customColor="red"
              onClick={() => {
                setDeleteProject(true);
              }}
              className="flex items-center justify-end"
              size="sm"
            />
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={deleteProject}
        onClose={() => setDeleteProject(false)}
        confirmText="Proceed"
        title="You are about to delete this project. This action is irreversible."
        onConfirm={() => {
          handleDeleteProject();
        }}
        loading={isDeleting}
        variant="warning"
      />
    </>
  );
};
