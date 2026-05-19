"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Users, Activity } from "lucide-react";
import { useProjectStore } from "@/lib/stores/projects/useProjectsStore";
import { useProjectEngagementStore } from "@/lib/stores/projects/useProjectEngagementStore";
import { useCollaboratorStore } from "@/lib/stores/projects/useCollaboratorStore";
import { useProjectAuditStore } from "@/lib/stores/projects/useProjectAuditStore";
import { ProjectHero } from "./ProjectHero";
import { ProjectInfoGrid } from "./ProjectInfoGrid";
import { EngagementSection } from "./EngagementSection";
import { CollaboratorList } from "./CollaboratorList";
import { AuditActivityFeed } from "./AuditActivityFeed";
import Button from "../buttons/Buttons";
import { ErrorMessage } from "../ui/ErrorMessage";
import { toast } from "../toastify/Toastify";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { useRouting } from "@/lib/hooks/routing/useRouting";
import { LoadingSkeletonDetail } from "./LoadingSkeletonDetail";

type DetailTab = "overview" | "engagement" | "collaborators" | "activity";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.project as string;

  const { projects, currentProject, setCurrentProject, fetchProject, loading, errors } = useProjectStore();
  const { fetchFullEngagement, fullEngagementByProject, loading: engagementLoading } = useProjectEngagementStore();
  const { fetchCollaborators, collaboratorsByProject, loading: collabLoading } = useCollaboratorStore();
  const { fetchRecentProjectActivity, recentActivityByProject, loading: auditLoading } = useProjectAuditStore();
  const { userInfo, publicUserInfo } = useUserSettings();
  const { extendRoute } = useRouting()

  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [projectLoaded, setProjectLoaded] = useState(false);

  // Resolve ownership
  useEffect(() => {
    if (!projectId || !userInfo) return;

    const project = projects.find((p) => p.id === projectId) || currentProject;
    if (project) {
      const isProjectOwner = project.user_associations?.some(
        (ua) => ua.user_id === userInfo.id && (ua.role === "creator" || ua.role === "owner")
      );
      setIsOwner(!!isProjectOwner);
    }
  }, [projectId, projects, currentProject, userInfo]);

  // Fetch project and related data
  useEffect(() => {
    if (!projectId) {
      toast.info("Project not found");
      return;
    }

    const loadData = async () => {
      try {
        // First, try to find the project in the store
        let project = projects.find((p) => p.id === projectId);

        // If project is not in the store, fetch it
        if (!project) {
          await fetchProject(projectId);
          // After fetching, find it again from the updated store
          project = projects.find((p) => p.id === projectId);
        }

        if (project) {
          setCurrentProject(project);
        }

        setProjectLoaded(true);

        // Fetch related data in parallel for better performance
        await Promise.all([
          fetchFullEngagement(projectId),
          fetchCollaborators(projectId)
        ]);

        // Only fetch audit logs if user is owner
        if (isOwner) {
          await fetchRecentProjectActivity(projectId, { limit: 20 });
        }
      } catch (err) {
        console.error("Error loading project data:", err);
        setError("Failed to load project data");
      }
    };

    loadData();
  }, [projectId]); // Remove isOwner from dependencies to prevent infinite loop

  // Fetch audit logs when ownership is determined
  useEffect(() => {
    if (projectLoaded && isOwner && projectId) {
      fetchRecentProjectActivity(projectId, { limit: 20 });
    }
  }, [projectLoaded, isOwner, projectId]);

  // Handle errors
  useEffect(() => {
    const err = errors.fetchProjects || errors.fetchFullEngagement || errors.fetchCollaborators;
    if (err) setError(err);
  }, [errors]);

  const project = currentProject || projects.find((p) => p.id === projectId);
  const engagement = fullEngagementByProject[projectId];
  const collaborators = collaboratorsByProject[projectId] || [];
  const auditLogs = recentActivityByProject[projectId] || [];

  if (!project && loading.fetchProjects) return <LoadingSkeletonDetail />;
  if (!project && projectLoaded) return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-semibold mb-2">Project not found</h2>
      <p className="text-[var(--foreground)]/60">{`The project you're looking for doesn't exist or you don't have access to it.`}</p>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/${userInfo?.username || "user"}/projects`)}
        className="mt-4"
        text="Back to Projects"
      />
    </div>
  );

  const tabs: { id: DetailTab; label: string; icon: typeof Users; ownerOnly?: boolean }[] = [
    { id: "overview", label: "Overview", icon: Activity }, // Fixed: was using ArrowLeft
    { id: "engagement", label: "Engagement", icon: Users },
    { id: "collaborators", label: "Collaborators", icon: Users },
    ...(isOwner ? [{ id: "activity" as DetailTab, label: "Activity", icon: Activity }] : []),
  ];

  return (
    <div className="min-h-screen">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--foreground)]/5">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push(`/${userInfo?.username || publicUserInfo?.username || "user"}/projects`)}
            className="flex items-center gap-2 text-sm text-[var(--foreground)]/60 hover:text-[var(--accent)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {isOwner && project && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/${userInfo?.username || "user"}/projects/${projectId}/collaborators`)}
                icon={<Users className="w-4 h-4" />}
                text="Manage Team"
              />
              <Button
                size="sm"
                onClick={() => router.push(`/${userInfo?.username || "user"}/projects/${projectId}/edit`)}
                icon={<Pencil className="w-4 h-4" />}
                text="Edit"
              />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {/* Hero */}
        {project && (
          <ProjectHero project={project} engagement={engagement} isOwner={isOwner} />
        )}

        {/* Tabs */}
        <div className="flex gap-1 mt-8 mb-6 p-1 rounded-xl bg-[var(--foreground)]/5 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === tab.id
                  ? "bg-[var(--background)] text-[var(--accent)] shadow-sm"
                  : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]/70"
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && project && (
            <ProjectInfoGrid project={project} />
          )}

          {activeTab === "engagement" && (
            <EngagementSection
              projectId={projectId}
              engagement={engagement}
              isLoading={engagementLoading.fetchFullEngagement || false}
            />
          )}

          {activeTab === "collaborators" && (
            <CollaboratorList
              projectId={projectId}
              collaborators={collaborators}
              isOwner={isOwner}
              isLoading={collabLoading.fetchCollaborators || false}
              onManage={() => extendRoute("/collaborators")}
            />
          )}

          {activeTab === "activity" && isOwner && (
            <AuditActivityFeed
              logs={auditLogs}
              isLoading={auditLoading.fetchRecentActivity || false}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}