"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Image, Settings, FileText, Check } from "lucide-react";
import { useProjectStore } from "@/lib/stores/projects/useProjectsStore";
import type { PortfolioProjectUpdate } from "@/lib/stores/projects/types/project.types";
import { ErrorMessage } from "../ui/ErrorMessage";
import Button from "../buttons/Buttons";
import { Textinput } from "../inputs/Textinput";
import { toast } from "../toastify/Toastify";
import { FileInput } from "../inputs/FileInput";
import MarkdownEditor from "../markdown/MarkdownEditor";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

type EditTab = "basic" | "media" | "settings";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.project as string;

  const { userInfo } = useUserSettings()
  const { projects, currentProject, updateProject, loading, errors, fetchProject } = useProjectStore();

  const [activeTab, setActiveTab] = useState<EditTab>("basic");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const project = currentProject || projects.find((p) => p.id === projectId);

  // Form state
  const [form, setForm] = useState<PortfolioProjectUpdate & { mediaSlots: Record<string, File | null> }>({
    project_name: "",
    project_description: null,
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

  const [stackInput, setStackInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [featuredInput, setFeaturedInput] = useState("");

  // Track which slots have had their existing URL explicitly cleared
  const [clearedSlots, setClearedSlots] = useState<Record<string, boolean>>({});

  // Returns the effective value for a FileInput slot:
  // - a new File if the user picked one
  // - the existing URL string if not yet replaced or cleared
  // - null if cleared or no existing URL
  const getSlotValue = (
    slotKey: keyof typeof form.mediaSlots,
    existingUrl: string | undefined
  ): File | string | null => {
    if (form.mediaSlots[slotKey]) return form.mediaSlots[slotKey];
    if (clearedSlots[slotKey]) return null;
    return existingUrl ?? null;
  };

  useEffect(() => {
    if (!project && projectId) {
      (async () => {
        await fetchProject(projectId)
      })()
    }
  }, [project, projectId, fetchProject])

  const handleSlotChange = (slotKey: keyof typeof form.mediaSlots, file: File | null) => {
    if (file === null) {
      // User hit clear — mark URL as cleared and remove any staged file
      setClearedSlots((prev) => ({ ...prev, [slotKey]: true }));
      setForm((prev) => ({ ...prev, mediaSlots: { ...prev.mediaSlots, [slotKey]: null } }));
    } else {
      setClearedSlots((prev) => ({ ...prev, [slotKey]: false }));
      setForm((prev) => ({ ...prev, mediaSlots: { ...prev.mediaSlots, [slotKey]: file } }));
    }
  };

  function getFormArrays(form: PortfolioProjectUpdate) {
    return {
      stack: form?.stack ?? [],
      tags: form?.tags ?? [],
      featured_in: form?.featured_in ?? []
    };
  }
  const formArrays = getFormArrays(form);


  // Load project data
  useEffect(() => {
    if (project) {
      setForm({
        project_name: project.project_name,
        project_description: project.project_description ?? null,
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
    }
  }, [project]);

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!projectId || !form.project_name) return;

    setIsSubmitting(true);
    const payload: PortfolioProjectUpdate = {
      project_name: form.project_name,
      project_description: form.project_description,
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

  const tabs: { id: EditTab; label: string; icon: typeof FileText }[] = [
    { id: "basic", label: "Basic Info", icon: FileText },
    { id: "media", label: "Media", icon: Image },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--foreground)]/30">Project not found</div>
      </div>
    );
  }
  if (loading.fetchProjectById) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--foreground)]/30">Loading Project Data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-full">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--foreground)]/5">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-[var(--foreground)]/60 hover:text-[var(--accent)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <Button
              onClick={handleSubmit}
              disabled={!form.project_name || loading.updateProject || isSubmitting}
              loading={loading.updateProject || isSubmitting}
              icon={<Save className="w-4 h-4" />}
              text="Save Changes"
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-league-700 mb-2">Edit Project</h1>
          <p className="text-[var(--foreground)]/50 mb-8">
            Update {project.project_name}
          </p>

          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

          {/* Tabs */}
          <div className="flex gap-1 mb-8 p-1 rounded-xl bg-[var(--foreground)]/5 w-fit">
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

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {activeTab === "basic" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textinput
                    label="Project Name"
                    value={form.project_name ?? ""}
                    onChange={(v) => set("project_name", v)}
                    required
                  />
                  <Textinput
                    label="Platform"
                    value={project.project_platform}
                    disabled
                    desc="Cannot change platform"
                    onChange={() => {
                      toast.info("Cannot change platform")
                    }}
                  />
                </div>

                <Textinput
                  label="Category"
                  value={form.project_category ?? ""}
                  onChange={(v) => set("project_category", v)}
                />

                <MarkdownEditor
                  label="Description"
                  value={form.project_description ?? ""}
                  onChange={(v) => set("project_description", v)}
                />

                <Textinput
                  label="Project URL"
                  value={form.project_url ?? ""}
                  onChange={(v) => set("project_url", v)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textinput
                    type="date"
                    label="Start Date"
                    value={form.start_date ?? ""}
                    onChange={(v) => set("start_date", v || null)}
                  />
                  <Textinput
                    type="date"
                    label="End Date"
                    value={form.end_date ?? ""}
                    onChange={(v) => set("end_date", v || null)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textinput
                    label="Client"
                    value={form.client_name ?? ""}
                    onChange={(v) => set("client_name", v)}
                  />
                  <Textinput
                    type="number"
                    label="Budget"
                    value={form.budget?.toString() ?? ""}
                    onChange={(v) => set("budget", v ? Number(v) : null)}
                  />
                </div>

                {/* Stack */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tech Stack</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={stackInput}
                      onChange={(e) => setStackInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && stackInput.trim()) {
                          set("stack", [...(form.stack ?? []), stackInput.trim()]);
                          setStackInput("");
                        }
                      }}
                      placeholder="Add technology and press Enter"
                      className="flex-1 px-3 py-2 rounded-xl border border-[var(--foreground)]/10 
                        bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--accent)]/50
                        placeholder:text-[var(--foreground)]/30"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(form.stack ?? []).map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs
                          bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20"
                      >
                        {tech}
                        <button
                          onClick={() => set("stack", (form.stack ?? []).filter((t) => t !== tech))}
                          className="hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && tagInput.trim()) {
                          set("tags", [...(form.tags ?? []), tagInput.trim()]);
                          setTagInput("");
                        }
                      }}
                      placeholder="Add tag and press Enter"
                      className="flex-1 px-3 py-2 rounded-xl border border-[var(--foreground)]/10 
                        bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--accent)]/50
                        placeholder:text-[var(--foreground)]/30"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(form.tags ?? []).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
                          bg-[var(--foreground)]/5 text-[var(--foreground)]/50 
                          border border-[var(--foreground)]/10"
                      >
                        {tag}
                        <button
                          onClick={() => set("tags", (form.tags ?? []).filter((t) => t !== tag))}
                          className="hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "media" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Hero Image</h3>
                  <FileInput
                    value={getSlotValue("hero_media", project.other_project_image_url?.hero_media?.url)}
                    onChange={(file) => handleSlotChange("hero_media", file)}
                  />
                </div>

                {["media_1", "media_2", "media_3"].map((slot) => {
                  const slotKey = slot as keyof typeof form.mediaSlots;
                  const existingUrl = project.other_project_image_url?.[slotKey as keyof typeof project.other_project_image_url]?.url;
                  return (
                    <div key={slot} className="space-y-2">
                      <h3 className="text-sm font-medium capitalize">{slot.replace("_", " ")}</h3>
                      <FileInput
                        value={getSlotValue(slotKey, existingUrl)}
                        onChange={(file) => handleSlotChange(slotKey, file)}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Visibility */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--foreground)]/10">
                  <div>
                    <p className="text-sm font-medium">Public Project</p>
                    <p className="text-xs text-[var(--foreground)]/40 mt-0.5">
                      Visible to everyone on your profile
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set("is_public", !form.is_public)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${form.is_public ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${form.is_public ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                {/* Completed */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--foreground)]/10">
                  <div>
                    <p className="text-sm font-medium">Completed</p>
                    <p className="text-xs text-[var(--foreground)]/40 mt-0.5">
                      Mark this project as finished
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set("is_completed", !form.is_completed)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${form.is_completed ? "bg-emerald-500" : "bg-[var(--foreground)]/20"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${form.is_completed ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                {/* Concept */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--foreground)]/10">
                  <div>
                    <p className="text-sm font-medium">Concept / Idea</p>
                    <p className="text-xs text-[var(--foreground)]/40 mt-0.5">
                      This is a work in progress or idea
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set("is_concept", !form.is_concept)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${form.is_concept ? "bg-amber-500" : "bg-[var(--foreground)]/20"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${form.is_concept ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                {/* Status */}
                <Textinput
                  type="dropdown"
                  label="Status"
                  options={[
                    { id: "active", code: "Active" },
                    { id: "archived", code: "Archived" },
                    { id: "draft", code: "Draft" },
                  ]}
                  value={form.status ?? "active"}
                  onChange={(v) => set("status", v)}
                />

                {/* Featured In */}
                <div>
                  <label className="block text-sm font-medium mb-2">Featured In</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={featuredInput}
                      onChange={(e) => setFeaturedInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && featuredInput.trim()) {
                          set("featured_in", [...(form.featured_in ?? []), featuredInput.trim()]);
                          setFeaturedInput("");
                        }
                      }}
                      placeholder="e.g., Product Hunt, TechCrunch"
                      className="flex-1 px-3 py-2 rounded-xl border border-[var(--foreground)]/10 
                        bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--accent)]/50
                        placeholder:text-[var(--foreground)]/30"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(form.featured_in ?? []).map((feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs
                          bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20"
                      >
                        <Check className="w-3 h-3" />
                        {feature}
                        <button
                          onClick={() => set("featured_in", (form.featured_in ?? []).filter((f) => f !== feature))}
                          className="hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}