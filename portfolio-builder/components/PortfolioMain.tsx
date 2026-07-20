"use client";

import { useEffect, useMemo, useCallback, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { usePortfolioStore } from "@/portfolio-builder/store/usePortfolioStore";
import HeroSectionController from "@/portfolio-builder/components/sections/hero/HeroSectionController";
import BioSectionController from "@/portfolio-builder/components/sections/bio/BioSectionController";
import PortfolioProLogo from "@/src/app/components/logo/PortfolioProTextLogo";
import { HeroData } from "@/portfolio-builder/types/hero";
import { BioData } from "@/portfolio-builder/types/bio";
import { LayoutData, syncSectionLinks } from "@/portfolio-builder/types/layout";
import { usePortfolioTheme } from "@/portfolio-builder/hooks/usePortfolioTheme";
import "@/portfolio-builder/styles/portfolio-theme.css";
import { SkillsSectionController } from "./sections/skills";
import { SkillsData } from "../types/skills";
import { ExperienceSectionController } from "./sections/experience";
import { ExperienceData } from "../types/experience";
import { EducationSectionController } from "./sections/education";
import { EducationData } from "../types/education";
import { CertificationSectionController } from "./sections/certification";
import { CertificationData } from "../types/certification";
import { useTheme } from "@/src/context/ThemeContext";
import { ProjectsData } from "../types/projects";
import { ProjectsSectionController } from "./sections/projects";
import { BlogsData } from "../types/blogs";
import { BlogsSectionController } from "./sections/blogs";
import { TestimonialsData } from "../types/testimonials";
import { TestimonialsSectionController } from "./sections/testimonials";
import { LayoutController } from "./sections/layout";
import { toast } from "@/src/context/Toastify";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

interface PortfolioMainProps {
  portfolioId: string;
  viewOnly: boolean
}

interface PortfolioSection {
  type: string;
  data: Record<string, unknown>;
}

interface PortfolioLayout {
  sections: PortfolioSection[];
}

/** All known section types in default order */
const ALL_SECTION_TYPES = [
  "hero",
  "bio",
  "skills",
  "experience",
  "education",
  "certification",
  "projects",
  "blogs",
  "testimonials",
];

// How often the autosave interval checks for dirty state. This is a
// backstop, not the primary trigger — the manual "Save changes" button and
// unmount both call the exact same flush(), and flush() itself is what
// decides whether there's actually anything new to send.
const AUTOSAVE_INTERVAL_MS = 30_000;

function getSectionData<T>(
  layout: Record<string, unknown> | null,
  sectionType: string
): T | null {
  if (!layout) return null;
  const sections = (layout as unknown as PortfolioLayout).sections;
  if (!sections || !Array.isArray(sections)) return null;
  const section = sections.find((s) => s.type === sectionType);
  if (!section) return null;
  return section.data as unknown as T;
}

function getTopLevelData<T>(
  layout: Record<string, unknown> | null,
  key: string
): T | null {
  if (!layout) return null;
  return (layout as Record<string, unknown>)[key] as T ?? null;
}

function setSectionData<T>(
  layout: Record<string, unknown> | null,
  sectionType: string,
  sectionData: T
): Record<string, unknown> {
  const currentLayout = layout ? (layout as unknown as PortfolioLayout) : { sections: [] };
  const sections = [...(currentLayout.sections || [])];
  const sectionIndex = sections.findIndex((s) => s.type === sectionType);

  if (sectionIndex >= 0) {
    sections[sectionIndex] = { type: sectionType, data: sectionData as unknown as Record<string, unknown> };
  } else {
    sections.push({ type: sectionType, data: sectionData as unknown as Record<string, unknown> });
  }

  return { ...layout, sections };
}

function removeSectionData(
  layout: Record<string, unknown> | null,
  sectionType: string
): Record<string, unknown> {
  const currentLayout = layout ? (layout as unknown as PortfolioLayout) : { sections: [] };
  const sections = (currentLayout.sections || []).filter((s) => s.type !== sectionType);
  return { ...layout, sections };
}

export default function PortfolioMain({ portfolioId, viewOnly }: PortfolioMainProps) {
  const {
    currentPortfolio,
    error,
    fetchPortfolioById,
    updatePortfolio,
    updateSectionsLocally,
    updateSectionDataLocally,
    updateLayoutDataLocally,
    savePortfolioOnUnload,
  } = usePortfolioStore();
  const { profileContext } = useTheme();
  const { fetchProfile } = useUserSettings()

  useEffect(() => {
    if (error) {
      toast.error(`${error} - Click to reload portfolio`, {
        title: "Something went wrong",
        duration: Infinity,
        onClose: () => fetchPortfolioById(portfolioId)
      })
    }
  }, [error])

  useEffect(() => {
    if (!viewOnly) {
      fetchProfile()
    }
  }, [viewOnly])

  // ── Baseline for dirty-tracking ──────────────────────────────────────────
  // JSON snapshot of the layout as it exists on the server (or as it was
  // after the last successful save). Compared against the live layout to
  // decide whether there's anything worth saving — this is what lets the
  // interval, the manual button, and unmount all share one flush() without
  // ever sending a duplicate PUT of unchanged data, no matter which one
  // fires first.
  const lastSavedLayoutRef = useRef<string>("");

  // Guards against a stale-data window during in-app navigation between two
  // portfolio editors (not a hard refresh): usePortfolioStore is global, so
  // `currentPortfolio` keeps holding the *previous* portfolio's data for a
  // moment while fetchPortfolioById for the new portfolioId is in flight.
  // Without this guard, isDirty could read true against stale data before
  // lastSavedLayoutRef has been (re)set for the portfolio actually being
  // viewed, which would let the Save button fire a save under the wrong ID.
  const [loadedPortfolioId, setLoadedPortfolioId] = useState<string | null>(null);

  useEffect(() => {
    setLoadedPortfolioId(null);
    fetchPortfolioById(portfolioId)
      .then((p) => {
        lastSavedLayoutRef.current = JSON.stringify(p.layout ?? null);
        setLoadedPortfolioId(portfolioId);
      })
      .catch(() => {
        // Failure already surfaces via the `error` state above.
      });
  }, [portfolioId]);

  // usePortfolioTheme now reads from the store itself — no args needed.
  // It handles CSS injection whenever currentPortfolio.layout.theme changes,
  // whether from ThemeToggle, ThemeTab, or a fresh fetch.
  const resolvedTheme = usePortfolioTheme();

  const layout = currentPortfolio?.layout ?? null;
  const portfolioSlug = currentPortfolio?.slug;

  // ── Layout data ───────────────────────────────────────────────────────────
  const layoutData = useMemo(
    () => getTopLevelData<LayoutData>(layout, "layout"),
    [layout]
  );

  // ── Available sections ────────────────────────────────────────────────────
  const availableSections = useMemo(() => {
    if (!layout) return ALL_SECTION_TYPES;
    const sections = (layout as unknown as PortfolioLayout).sections ?? [];
    const types = sections.map((s) => s.type);
    return ALL_SECTION_TYPES.filter((t) => types.includes(t));
  }, [layout]);

  // ── Sections not yet added to the portfolio ───────────────────────────────
  const missingSections = useMemo(
    () => ALL_SECTION_TYPES.filter((t) => !availableSections.includes(t)),
    [availableSections]
  );

  // ── Section links ─────────────────────────────────────────────────────────
  const sectionLinks = useMemo(() => {
    const navLinks = layoutData?.navbar?.sectionLinks ?? [];
    return syncSectionLinks(navLinks, availableSections);
  }, [layoutData, availableSections]);

  // ── Section data ──────────────────────────────────────────────────────────
  const heroData = useMemo(() => getSectionData<HeroData>(layout, "hero"), [layout]);
  const bioData = useMemo(() => getSectionData<BioData>(layout, "bio"), [layout]);
  const skillsData = useMemo(() => getSectionData<SkillsData>(layout, "skills"), [layout]);
  const experienceData = useMemo(() => getSectionData<ExperienceData>(layout, "experience"), [layout]);
  const educationData = useMemo(() => getSectionData<EducationData>(layout, "education"), [layout]);
  const certificationData = useMemo(() => getSectionData<CertificationData>(layout, "certification"), [layout]);
  const projectsData = useMemo(() => getSectionData<ProjectsData>(layout, "projects"), [layout]);
  const blogsData = useMemo(() => getSectionData<BlogsData>(layout, "blogs"), [layout]);
  const testimonialsData = useMemo(() => getSectionData<TestimonialsData>(layout, "testimonials"), [layout]);

  // ── Serialized save queue ────────────────────────────────────────────────
  // Every network write to the portfolio (autosave flush, or the explicit
  // "Save Layout" action from LayoutController) goes through here so two
  // writes can never race each other. Each queued job reads the layout
  // fresh from the store at execution time and, on success, updates
  // lastSavedLayoutRef so dirty-tracking stays accurate no matter which
  // caller triggered the save.
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  const queueLayoutSave = useCallback(
    (mutate: (latestLayout: Record<string, unknown> | null) => Record<string, unknown>) => {
      const run = async () => {
        const latestLayout = usePortfolioStore.getState().currentPortfolio?.layout ?? null;
        await updatePortfolio(portfolioId, { layout: mutate(latestLayout) });
        lastSavedLayoutRef.current = JSON.stringify(
          usePortfolioStore.getState().currentPortfolio?.layout ?? null
        );
      };
      const next = saveQueueRef.current.then(run, run);
      saveQueueRef.current = next.catch(() => { });
      return next;
    },
    [portfolioId, updatePortfolio]
  );

  // ── Autosave flush ───────────────────────────────────────────────────────
  // Re-checks freshness against lastSavedLayoutRef every time it's called —
  // this single check is what makes it safe for the interval, the manual
  // button, and unmount to all call the exact same function: whichever one
  // fires first does the save, and the others become no-ops because
  // there's nothing new since the last successful write.
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "error">("idle");

  const flush = useCallback(async () => {
    if (loadedPortfolioId !== portfolioId) return;
    const latestLayout = usePortfolioStore.getState().currentPortfolio?.layout ?? null;
    if (JSON.stringify(latestLayout) === lastSavedLayoutRef.current) return;

    setSaveStatus("saving");
    try {
      await queueLayoutSave((latest) => latest ?? {});
      setSaveStatus("idle");
    } catch {
      setSaveStatus("error");
    }
  }, [queueLayoutSave, loadedPortfolioId, portfolioId]);

  // 30s interval trigger — backstop for whenever the user just keeps
  // editing without pausing long enough to naturally trigger anything else.
  useEffect(() => {
    const id = setInterval(() => {
      flush();
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [flush]);

  // Unmount trigger — covers in-app navigation away from the editor
  // (e.g. routing to a different page) where beforeunload never fires.
  useEffect(() => {
    return () => {
      flush();
    };
  }, [flush]);

  // Tab close / reload trigger — bypasses the queue (can't be awaited from
  // inside beforeunload) in favor of the keepalive path, but keeps the same
  // dedupe check so a clean close with nothing pending doesn't fire an
  // unnecessary request.
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (loadedPortfolioId !== portfolioId) return;
      const latestLayout = usePortfolioStore.getState().currentPortfolio?.layout ?? null;
      if (JSON.stringify(latestLayout) === lastSavedLayoutRef.current) return;
      savePortfolioOnUnload(portfolioId, { layout: latestLayout || undefined });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [portfolioId, savePortfolioOnUnload, loadedPortfolioId]);

  const isDirty = useMemo(
    () =>
      loadedPortfolioId === portfolioId &&
      JSON.stringify(layout) !== lastSavedLayoutRef.current,
    [layout, loadedPortfolioId, portfolioId]
  );

  // ── Section change handlers ──────────────────────────────────────────────
  // Every editor is now a pure controlled component: it calls onChange on
  // every edit, and we write straight into the store (optimistic,
  // synchronous, no network call). flush() is what eventually persists it —
  // these handlers never touch the network directly.
  const handleHeroChange = useCallback((updated: HeroData) => {
    if (!portfolioSlug) return;
    updateSectionDataLocally(portfolioSlug, "hero", updated as unknown as Record<string, unknown>);
  }, [portfolioSlug, updateSectionDataLocally]);

  const handleBioChange = useCallback((updated: BioData) => {
    if (!portfolioSlug) return;
    updateSectionDataLocally(portfolioSlug, "bio", updated as unknown as Record<string, unknown>);
  }, [portfolioSlug, updateSectionDataLocally]);

  const handleSkillsChange = useCallback((updated: SkillsData) => {
    if (!portfolioSlug) return;
    updateSectionDataLocally(portfolioSlug, "skills", updated as unknown as Record<string, unknown>);
  }, [portfolioSlug, updateSectionDataLocally]);

  const handleExperienceChange = useCallback((updated: ExperienceData) => {
    if (!portfolioSlug) return;
    updateSectionDataLocally(portfolioSlug, "experience", updated as unknown as Record<string, unknown>);
  }, [portfolioSlug, updateSectionDataLocally]);

  const handleEducationChange = useCallback((updated: EducationData) => {
    if (!portfolioSlug) return;
    updateSectionDataLocally(portfolioSlug, "education", updated as unknown as Record<string, unknown>);
  }, [portfolioSlug, updateSectionDataLocally]);

  const handleCertificationChange = useCallback((updated: CertificationData) => {
    if (!portfolioSlug) return;
    updateSectionDataLocally(portfolioSlug, "certification", updated as unknown as Record<string, unknown>);
  }, [portfolioSlug, updateSectionDataLocally]);

  const handleProjectsChange = useCallback((updated: ProjectsData) => {
    if (!portfolioSlug) return;
    updateSectionDataLocally(portfolioSlug, "projects", updated as unknown as Record<string, unknown>);
  }, [portfolioSlug, updateSectionDataLocally]);

  const handleBlogsChange = useCallback((updated: BlogsData) => {
    if (!portfolioSlug) return;
    updateSectionDataLocally(portfolioSlug, "blogs", updated as unknown as Record<string, unknown>);
  }, [portfolioSlug, updateSectionDataLocally]);

  const handleTestimonialsChange = useCallback((updated: TestimonialsData) => {
    if (!portfolioSlug) return;
    updateSectionDataLocally(portfolioSlug, "testimonials", updated as unknown as Record<string, unknown>);
  }, [portfolioSlug, updateSectionDataLocally]);

  // ── Layout change ─────────────────────────────────────────────────────────
  // LayoutController/LayoutEditor are pure controlled components now — they
  // never save anything themselves. Every edit lands here and writes
  // straight into the store (optimistic, synchronous, no network call),
  // exactly like every other section's onChange. flush() (via the existing
  // autosave interval/manual button/unmount triggers) is the only thing
  // that ever persists it to the server.
  const handleLayoutChange = useCallback((updated: LayoutData) => {
    if (!portfolioSlug) return;
    updateLayoutDataLocally(portfolioSlug, updated);
  }, [portfolioSlug, updateLayoutDataLocally]);

  // ── Add / remove section ─────────────────────────────────────────────────
  // Seeds an empty data object for the new section type. Individual
  // *SectionController components are expected to render sensibly against
  // an empty/null data shape (same contract they already have on first load).
  const handleAddSection = useCallback((sectionType: string) => {
    if (!currentPortfolio || availableSections.includes(sectionType)) return;
    const nextLayout = setSectionData(layout, sectionType, {}) as unknown as PortfolioLayout;
    updateSectionsLocally(currentPortfolio.slug, nextLayout.sections as unknown as Record<string, unknown>[]);
  }, [currentPortfolio, layout, availableSections, updateSectionsLocally]);

  const handleRemoveSection = useCallback((sectionType: string) => {
    if (!currentPortfolio) return;
    const nextLayout = removeSectionData(layout, sectionType) as unknown as PortfolioLayout;
    updateSectionsLocally(currentPortfolio.slug, nextLayout.sections as unknown as Record<string, unknown>[]);
  }, [currentPortfolio, layout, updateSectionsLocally]);

  const currentUsername = profileContext.username;

  if (!currentPortfolio || loadedPortfolioId !== portfolioId) {
    return (
      <div className="flex items-center flex-col justify-center min-h-screen bg-[var(--pb-background)]">
        <PortfolioProLogo scale={0.7} />
        <p className="text-[var(--pb-text-muted)]">Loading portfolio...</p>
      </div>
    );
  }

  const renderSection = (sectionType: string) => {
    switch (sectionType) {
      case "hero":
        return (
          <section id="hero" key="hero">
            <HeroSectionController heroData={heroData} viewOnly={viewOnly} onChange={handleHeroChange} theme={resolvedTheme} />
          </section>
        );
      case "bio":
        return (
          <section id="bio" key="bio">
            <BioSectionController bioData={bioData} viewOnly={viewOnly} onChange={handleBioChange} />
          </section>
        );
      case "skills":
        return (
          <section id="skills" key="skills">
            <SkillsSectionController skillsData={skillsData} viewOnly={viewOnly} onChange={handleSkillsChange} username={currentUsername || ""} />
          </section>
        );
      case "experience":
        return (
          <section id="experience" key="experience">
            <ExperienceSectionController experienceData={experienceData} viewOnly={viewOnly} onChange={handleExperienceChange} username={currentUsername || ""} />
          </section>
        );
      case "education":
        return (
          <section id="education" key="education">
            <EducationSectionController educationData={educationData} viewOnly={viewOnly} onChange={handleEducationChange} username={currentUsername || ""} />
          </section>
        );
      case "certification":
        return (
          <section id="certification" key="certification">
            <CertificationSectionController certificationData={certificationData} viewOnly={viewOnly} onChange={handleCertificationChange} username={currentUsername || ""} />
          </section>
        );
      case "projects":
        return (
          <section id="projects" key="projects">
            <ProjectsSectionController projectsData={projectsData} viewOnly={viewOnly} onChange={handleProjectsChange} username={currentUsername || ""} />
          </section>
        );
      case "blogs":
        return (
          <section id="blogs" key="blogs">
            <BlogsSectionController blogsData={blogsData} viewOnly={viewOnly} onChange={handleBlogsChange} username={currentUsername || ""} />
          </section>
        );
      case "testimonials":
        return (
          <section id="testimonials" key="testimonials">
            <TestimonialsSectionController testimonialsData={testimonialsData} viewOnly={viewOnly} onChange={handleTestimonialsChange} username={currentUsername || ""} />
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <LayoutController
        layoutData={layoutData}
        viewOnly={viewOnly}
        onChange={handleLayoutChange}
        availableSections={availableSections}
        sectionLinks={sectionLinks}
        missingSections={missingSections}
        onAddSection={handleAddSection}
        onRemoveSection={handleRemoveSection}
      >
        {ALL_SECTION_TYPES.map((sectionType) => renderSection(sectionType))}
      </LayoutController>

      {!viewOnly && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={flush}
            disabled={saveStatus === "saving" || !isDirty}
            className={`px-5 py-2.5 rounded-full font-medium text-sm shadow-lg backdrop-blur transition-colors flex items-center gap-2 border ${saveStatus === "error"
              ? "bg-[var(--pb-error-bg)] text-[var(--pb-error)] border-[var(--pb-error-border)]"
              : isDirty
                ? "bg-[var(--pb-foreground)] text-[var(--pb-background)] border-transparent hover:opacity-90"
                : "bg-[var(--pb-foreground-10)] text-[var(--pb-text-muted)] border-[var(--pb-border)] cursor-default"
              }`}
          >
            {saveStatus === "saving" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saveStatus === "saving"
              ? "Saving..."
              : saveStatus === "error"
                ? "Save failed — Retry"
                : isDirty
                  ? "Save changes"
                  : "All changes saved"}
          </button>
        </div>
      )}
    </>
  );
}               