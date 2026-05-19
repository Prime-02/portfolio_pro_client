"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Image, Settings, FileText, Check } from "lucide-react";
import { useProjectStore } from "@/lib/stores/projects/useProjectsStore";
import type { PortfolioProjectCreate } from "@/lib/stores/projects/types/project.types";
import Button from "../buttons/Buttons";
import { ErrorMessage } from "../ui/ErrorMessage";
import { Textinput } from "../inputs/Textinput";
import { FileInput } from "../inputs/FileInput";
import MarkdownEditor from "../markdown/MarkdownEditor";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

type CreateTab = "basic" | "media" | "settings";

export default function CreateProjectPage() {
  const router = useRouter();
  const { createProject, loading, errors } = useProjectStore();
  const {userInfo} = useUserSettings()

  const [activeTab, setActiveTab] = useState<CreateTab>("basic");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState<PortfolioProjectCreate & { mediaSlots: Record<string, File | null> }>({
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

  const [stackInput, setStackInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [featuredInput, setFeaturedInput] = useState("");

  function getFormArrays(form: PortfolioProjectCreate) {
    return {
      stack: form?.stack ?? [],
      tags: form?.tags ?? [],
      featured_in: form?.featured_in ?? []
    };
  }
  const formArrays = getFormArrays(form);

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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
      stack: formArrays.stack.length > 0 ? form.stack : undefined,
      tags: formArrays.tags.length > 0 ? form.tags : undefined,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
      budget: form.budget,
      client_name: form.client_name || undefined,
      status: form.status || undefined,
      featured_in: formArrays.featured_in.length > 0 ? formArrays.featured_in : undefined,
    };

    // Add media as project_media array for the API
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

  const tabs: { id: CreateTab; label: string; icon: typeof FileText }[] = [
    { id: "basic", label: "Basic Info", icon: FileText },
    { id: "media", label: "Media", icon: Image },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const isValid = form.project_name && form.project_platform;

  return (
    <div className="min-h-screen">
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
            disabled={!isValid || loading.createProject || isSubmitting}
            loading={loading.createProject || isSubmitting}
            icon={<Plus className="w-4 h-4" />}
            text="Create Project"
            />
            </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-league-700 mb-2">New Project</h1>
          <p className="text-[var(--foreground)]/50 mb-8">
            Showcase your work with rich media, engagement, and collaboration.
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
                    desc="e.g., E-commerce Dashboard"
                    value={form.project_name}
                    onChange={(v) => set("project_name", v)}
                    required
                  />
                  <Textinput
                    label="Platform"
                    desc="e.g., Web, Mobile, Desktop"
                    value={form.project_platform}
                    onChange={(v) => set("project_platform", v)}
                    required
                  />
                </div>

                <Textinput
                  label="Category"
                  desc="e.g., SaaS, E-commerce, AI Tool"
                  value={form.project_category ?? ""}
                  onChange={(v) => set("project_category", v)}
                />

                <MarkdownEditor
                  label="Description"
                  hint="What does this project do?"
                  value={form.project_description ?? ""}
                  onChange={(v) => set("project_description", v)}
                  minHeight="100px"
                />

                <MarkdownEditor
                  label="Your Contribution"
                  hint="What was your role in this project?"
                  value={form.contribution_description ?? ""}
                  onChange={(v) => set("contribution_description", v)}
                  minHeight="100px"
                />

                <Textinput
                  label="Project URL"
                  desc="https://..."
                  value={form.project_url ?? ""}
                  onChange={(v) => set("project_url", v)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textinput
                    type="date"
                    label="Start Date"
                    value={form.start_date ?? ""}
                    onChange={(v) => set("start_date", v)}
                  />
                  <Textinput
                    type="date"
                    label="End Date"
                    value={form.end_date ?? ""}
                    onChange={(v) => set("end_date", v)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textinput
                    label="Client"
                    desc="Who was this for?"
                    value={form.client_name ?? ""}
                    onChange={(v) => set("client_name", v)}
                  />
                  <Textinput
                    type="number"
                    label="Budget"
                    desc="Approximate budget in USD"
                    value={form.budget?.toString() ?? ""}
                    onChange={(v) => set("budget", v ? Number(v) : undefined)}
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
                          set("stack", [...form.stack ?? [], stackInput.trim()]);
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
                          onClick={() => set("stack", formArrays.stack.filter((t) => t !== tech))}
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
                          set("tags", [...formArrays.tags, tagInput.trim()]);
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
                    {formArrays.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
                          bg-[var(--foreground)]/5 text-[var(--foreground)]/50 
                          border border-[var(--foreground)]/10"
                      >
                        {tag}
                        <button
                          onClick={() => set("tags", formArrays.tags.filter((t) => t !== tag))}
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
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Hero Image</h3>
                  <p className="text-xs text-[var(--foreground)]/40">
                    Main showcase image — displayed prominently in listings
                  </p>
                  <FileInput
                    value={form.mediaSlots.hero_media}
                    onChange={(file) =>
                      setForm((prev) => ({ ...prev, mediaSlots: { ...prev.mediaSlots, hero_media: file } }))
                    }
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Media 1</h3>
                  <p className="text-xs text-[var(--foreground)]/40">Additional screenshot or image</p>
                  <FileInput
                    value={form.mediaSlots.media_1}
                    onChange={(file) =>
                      setForm((prev) => ({ ...prev, mediaSlots: { ...prev.mediaSlots, media_1: file } }))
                    }
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Media 2</h3>
                  <p className="text-xs text-[var(--foreground)]/40">Additional screenshot or image</p>
                  <FileInput
                    value={form.mediaSlots.media_2}
                    onChange={(file) =>
                      setForm((prev) => ({ ...prev, mediaSlots: { ...prev.mediaSlots, media_2: file } }))
                    }
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Media 3</h3>
                  <p className="text-xs text-[var(--foreground)]/40">Additional screenshot or image</p>
                  <FileInput
                    value={form.mediaSlots.media_3}
                    onChange={(file) =>
                      setForm((prev) => ({ ...prev, mediaSlots: { ...prev.mediaSlots, media_3: file } }))
                    }
                  />
                </div>
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
                          set("featured_in", [...formArrays.featured_in, featuredInput.trim()]);
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
                    {formArrays.featured_in.map((feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs
                          bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20"
                      >
                        <Check className="w-3 h-3" />
                        {feature}
                        <button
                          onClick={() => set("featured_in", formArrays.featured_in.filter((f) => f !== feature))}
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
