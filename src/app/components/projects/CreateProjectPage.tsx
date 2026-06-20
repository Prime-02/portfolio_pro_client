"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useProjectStore } from "@/lib/stores/projects/useProjectsStore";
import type { PortfolioProjectCreate } from "@/lib/stores/projects/types/project.types";
import { ErrorMessage } from "../ui/ErrorMessage";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { CreateProjectHeader } from "./createProjectPageComponents/CreateProjectHeader";
import { CreateProjectTabs, type CreateTab } from "./createProjectPageComponents/CreateProjectTabs";
import { BasicInfoTab } from "./createProjectPageComponents/BasicInfoTab";
import { MediaTab } from "./createProjectPageComponents/MediaTab";
import { SettingsTab } from "./createProjectPageComponents/SettingsTab";

type FormState = PortfolioProjectCreate & { mediaSlots: Record<string, File | null> };

export default function CreateProjectPage() {
  const router = useRouter();
  const { createProject, loading, errors } = useProjectStore();
  const { userInfo } = useUserSettings();

  const [activeTab, setActiveTab] = useState<CreateTab>("basic");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<FormState>({
    project_name: "",
    project_description: "",
    project_platform: "",
    project_category: "",
    contribution_description: "",
    project_url: "",
    is_concept: false,
    is_completed: false,
    is_public: true,
    stack: [],
    tags: [],
    start_date: "",
    end_date: "",
    budget: undefined,
    client_name: "",
    status: "active",
    featured_in: [],
    mediaSlots: { hero_media: null, media_1: null, media_2: null, media_3: null },
  });

  const set = (key: keyof FormState, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleMediaSlotChange = (key: string, file: File | null) =>
    setForm((prev) => ({ ...prev, mediaSlots: { ...prev.mediaSlots, [key]: file } }));

  const handleSubmit = async () => {
    if (!form.project_name || !form.project_platform) return;

    setIsSubmitting(true);

    const payload: PortfolioProjectCreate = {
      project_name: form.project_name,
      project_description: form.project_description || undefined,
      project_platform: form.project_platform,
      project_category: form.project_category || undefined,
      contribution_description: form.contribution_description || undefined,
      project_url: form.project_url || undefined,
      is_concept: form.is_concept,
      is_completed: form.is_completed,
      is_public: form.is_public,
      stack: (form.stack ?? []).length > 0 ? form.stack : undefined,
      tags: (form.tags ?? []).length > 0 ? form.tags : undefined,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
      budget: form.budget,
      client_name: form.client_name || undefined,
      status: form.status || undefined,
      featured_in: (form.featured_in ?? []).length > 0 ? form.featured_in : undefined,
    };

    const mediaFiles = Object.values(form.mediaSlots).filter(Boolean) as File[];
    if (mediaFiles.length > 0) {
      payload.project_media = mediaFiles;
    }

    const result = await createProject(payload);
    setIsSubmitting(false);

    if (result) {
      router.push(`/${userInfo?.username}/projects/${result.id}`);
    } else {
      setError(errors.createProject ?? "Failed to create project");
    }
  };

  const isValid = !!(form.project_name && form.project_platform);

  return (
    <div className="min-h-screen">
      <CreateProjectHeader
        onBack={() => router.back()}
        onSubmit={handleSubmit}
        isValid={isValid}
        isLoading={loading.createProject || isSubmitting}
      />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-league-700 mb-2">New Project</h1>
          <p className="text-[var(--foreground)]/50 mb-8">
            Showcase your work with rich media, engagement, and collaboration.
          </p>

          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

          <CreateProjectTabs activeTab={activeTab} onChange={setActiveTab} />

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {activeTab === "basic" && (
              <BasicInfoTab
                form={form}
                set={set}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            )}
            {activeTab === "media" && (
              <MediaTab
                mediaSlots={form.mediaSlots}
                onSlotChange={handleMediaSlotChange}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            )}
            {activeTab === "settings" && (
              <SettingsTab
                form={form}
                set={set}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}