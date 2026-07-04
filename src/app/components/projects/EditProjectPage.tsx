"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useProjectStore } from "@/lib/stores/projects/useProjectsStore";
import type { PortfolioProjectUpdate } from "@/lib/stores/projects/types/project.types";
import { ErrorMessage } from "../ui/ErrorMessage";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { EditProjectHeader } from "./editProjectPageComponents/EditProjectHeader";
import { EditProjectTabs, type EditTab } from "./editProjectPageComponents/EditProjectTabs";
import { EditBasicInfoTab } from "./editProjectPageComponents/EditBasicInfoTab";
import { EditMediaTab, MediaSlotKey } from "./editProjectPageComponents/EditMediaTab";
import { EditSettingsTab } from "./editProjectPageComponents/EditSettingsTab";

type FormState = PortfolioProjectUpdate & { mediaSlots: Record<string, File | null> };

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.project as string;

  const { userInfo } = useUserSettings();
  const { projects, currentProject, updateProject, loading, errors, fetchProject } = useProjectStore();

  const [activeTab, setActiveTab] = useState<EditTab>("basic");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clearedSlots, setClearedSlots] = useState<Record<string, boolean>>({});

  // Find project from store (check currentProject first, then projects array)
  const project = useMemo(() => {
    if (currentProject?.id === projectId) return currentProject;
    return projects.find((p) => p.id === projectId) || currentProject;
  }, [currentProject, projects, projectId]);

  const [form, setForm] = useState<FormState>({
    project_name: "",
    project_description: null,
    project_summary: null,
    project_category: null,
    project_url: null,
    project_image_url: null,
    is_public: true,
    is_completed: false,
    is_concept: false,
    stack: [],
    tags: [],
    start_date: null,
    end_date: null,
    budget: null,
    client_name: null,
    status: "active",
    featured_in: [],
    mediaSlots: { hero_media: null, media_1: null, media_2: null, media_3: null },
  });

  // Only fetch if project is not in store
  useEffect(() => {
    if (projectId && !project) {
      fetchProject(projectId);
    }
  }, [projectId, project, fetchProject]);

  // Sync form state when the project data is available and matches current projectId
  useEffect(() => {
    if (project && project.id === projectId) {
      setForm({
        project_name: project.project_name,
        project_description: project.project_description ?? null,
        project_summary: project.project_summary ?? null,
        project_category: project.project_category ?? null,
        project_url: project.project_url ?? null,
        project_image_url: project.project_image_url ?? null,
        is_public: project.is_public,
        is_completed: project.is_completed ?? false,
        is_concept: project.is_concept ?? false,
        stack: project.stack ?? [],
        tags: project.tags ?? [],
        start_date: project.start_date ?? null,
        end_date: project.end_date ?? null,
        budget: project.budget ?? null,
        client_name: project.client_name ?? null,
        status: project.status ?? "active",
        featured_in: project.featured_in ?? [],
        mediaSlots: { hero_media: null, media_1: null, media_2: null, media_3: null },
      });
      // Reset cleared slots when switching projects
      setClearedSlots({});
      // Clear any previous errors
      setError(null);
    }
  }, [project, projectId]);

  const set = (key: keyof FormState, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const getSlotValue = (
    slotKey: keyof typeof form.mediaSlots,
    existingUrl: string | undefined
  ): File | string | null => {
    if (form.mediaSlots[slotKey]) return form.mediaSlots[slotKey];
    if (clearedSlots[slotKey]) return null;
    return existingUrl ?? null;
  };

  const handleSlotChange = (slotKey: keyof typeof form.mediaSlots, file: File | null) => {
    if (file === null) {
      setClearedSlots((prev) => ({ ...prev, [slotKey]: true }));
      setForm((prev) => ({ ...prev, mediaSlots: { ...prev.mediaSlots, [slotKey]: null } }));
    } else {
      setClearedSlots((prev) => ({ ...prev, [slotKey]: false }));
      setForm((prev) => ({ ...prev, mediaSlots: { ...prev.mediaSlots, [slotKey]: file } }));
    }
  };

  const handleSubmit = async () => {
    if (!projectId || !form.project_name) return;

    setIsSubmitting(true);

    const formArrays = {
      stack: form.stack ?? [],
      tags: form.tags ?? [],
      featured_in: form.featured_in ?? [],
    };

    const payload: PortfolioProjectUpdate = {
      project_name: form.project_name,
      project_description: form.project_description,
      project_summary: form.project_summary,
      project_category: form.project_category,
      project_url: form.project_url,
      project_image_url: form.project_image_url,
      is_public: form.is_public,
      is_completed: form.is_completed,
      is_concept: form.is_concept,
      stack: formArrays.stack.length > 0 ? form.stack : undefined,
      tags: formArrays.tags.length > 0 ? form.tags : undefined,
      start_date: form.start_date,
      end_date: form.end_date,
      budget: form.budget,
      client_name: form.client_name,
      status: form.status,
      featured_in: formArrays.featured_in.length > 0 ? form.featured_in : undefined,
      hero_media: form.mediaSlots.hero_media ?? undefined,
      media_1: form.mediaSlots.media_1 ?? undefined,
      media_2: form.mediaSlots.media_2 ?? undefined,
      media_3: form.mediaSlots.media_3 ?? undefined,
    };

    const result = await updateProject(projectId, payload);
    setIsSubmitting(false);

    if (result) {
      router.push(`/${userInfo?.username || "user"}/projects/${projectId}`);
    } else {
      setError(errors.updateProject ?? "Failed to update project");
    }
  };

  // Show loading state only when we're actually fetching (project not in store)
  if (!project && loading.fetchProjectById) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--foreground)]/30">Loading Project Data</div>
      </div>
    );
  }

  // Show not found only after fetch attempt completed and still no project
  if (!project && !loading.fetchProjectById) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--foreground)]/30">Project not found</div>
      </div>
    );
  }

  if (!project) return null;

  const mediaSlots = [
    {
      key: "hero_media" as MediaSlotKey,
      label: "Hero Image",
      value: getSlotValue("hero_media", project.other_project_image_url?.hero_media?.url),
      onChange: (file: File | null) => handleSlotChange("hero_media", file),
    },
    ...["media_1", "media_2", "media_3"].map((slot) => {
      const slotKey = slot as MediaSlotKey;
      const existingUrl =
        project.other_project_image_url?.[slotKey as keyof typeof project.other_project_image_url]?.url;
      return {
        key: slotKey,
        label: slot.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        value: getSlotValue(slotKey, existingUrl),
        onChange: (file: File | null) => handleSlotChange(slotKey, file),
      };
    }),
  ];

  return (
    <div className="min-h-screen h-full">
      <EditProjectHeader
        onBack={() => router.back()}
        onSubmit={handleSubmit}
        isValid={!!form.project_name}
        isLoading={loading.updateProject || isSubmitting}
      />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-league-700 mb-2">Edit Project</h1>
          <p className="text-[var(--foreground)]/50 mb-8">Update {project.project_name}</p>

          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

          <EditProjectTabs activeTab={activeTab} onChange={setActiveTab} />

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {activeTab === "basic" && (
              <EditBasicInfoTab form={form} projectPlatform={project.project_platform} set={set} />
            )}
            {activeTab === "media" && <EditMediaTab projectId={projectId} slots={mediaSlots} />}
            {activeTab === "settings" && <EditSettingsTab form={form} set={set} />}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}