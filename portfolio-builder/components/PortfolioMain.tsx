"use client";

import { useEffect, useMemo, useCallback, useState, useRef } from "react";
import { usePortfolioStore } from "@/portfolio-builder/store/usePortfolioStore";
import HeroSectionController from "@/portfolio-builder/components/sections/hero/HeroSectionController";
import BioSectionController from "@/portfolio-builder/components/sections/bio/BioSectionController";
import PortfolioProLogo from "@/src/app/components/logo/PortfolioProTextLogo";
import { HeroData } from "@/portfolio-builder/types/hero";
import { BioData } from "@/portfolio-builder/types/bio";
import { LayoutData, syncSectionLinks } from "@/portfolio-builder/types/layout";
import { usePortfolioTheme, PortfolioThemeData } from "@/portfolio-builder/hooks/usePortfolioTheme";
import "@/portfolio-builder/styles/portfolio-theme.css";
import { SkillsSectionController } from "./sections/skills";
import { SkillsData } from "../types/skills";
import { ExperienceSectionController } from "./sections/experience";
import { ExperienceData } from "../types/experience";
import { EducationSectionController } from "./sections/education";
import { EducationData } from "../types/education";
import { CertificationSectionController } from "./sections/certification";
import { CertificationData } from "../types/certification";
import { useTheme } from "@/src/app/components/theme/ThemeContext ";
import { ProjectsData } from "../types/projects";
import { ProjectsSectionController } from "./sections/projects";
import { BlogsData } from "../types/blogs";
import { BlogsSectionController } from "./sections/blogs";
import { TestimonialsData } from "../types/testimonials";
import { TestimonialsSectionController } from "./sections/testimonials";
import { LayoutController } from "./sections/layout";
import { ThemeToggleProvider } from "./shared/ui/ThemeToggle";

interface PortfolioMainProps {
  portfolioId: string;
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

export default function PortfolioMain({ portfolioId }: PortfolioMainProps) {
  const { currentPortfolio, error, fetchPortfolioById, updatePortfolio } =
    usePortfolioStore();
  const { profileContext } = useTheme();

  useEffect(() => {
    fetchPortfolioById(portfolioId);
  }, [portfolioId]);

  const layout = currentPortfolio?.layout ?? null;

  const savedTheme = useMemo(
    () => getTopLevelData<PortfolioThemeData>(layout, "theme"),
    [layout]
  );

  // ── ThemeToggle variant state ─────────────────────────────────────────────
  // Tracks the active themeVariant locally so the toggle icon stays responsive
  // without waiting for a store round-trip. Seeded once from savedTheme, then
  // updated by the toggle and by the layout editor (via handleLayoutSave).
  const [liveVariant, setLiveVariant] = useState<"light" | "dark" | "system">(
    () => (savedTheme?.themeVariant ?? "system") as "light" | "dark" | "system"
  );

  const themeSeededRef = useRef(false);
  const seededPortfolioIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (seededPortfolioIdRef.current !== portfolioId) {
      seededPortfolioIdRef.current = portfolioId;
      themeSeededRef.current = false;
    }
    if (themeSeededRef.current) return;
    if (!savedTheme) return;
    themeSeededRef.current = true;
    setLiveVariant((savedTheme.themeVariant ?? "system") as "light" | "dark" | "system");
  }, [savedTheme, portfolioId]);

  // Build the full theme object for CSS injection — always from the store
  // (the layout editor writes directly to the store, so it's always current).
  const themeData = useMemo(
    () => savedTheme ? { ...savedTheme, themeVariant: liveVariant } : null,
    [savedTheme, liveVariant]
  );

  const resolvedTheme = usePortfolioTheme(themeData);

  // ── Layout data ───────────────────────────────────────────────────────────
  const layoutData = useMemo(() => {
    const ld = getTopLevelData<LayoutData>(layout, "layout");
    if (!savedTheme) return ld;
    return { ...(ld ?? {}), theme: savedTheme } as LayoutData;
  }, [layout, savedTheme]);

  // ── Available sections ────────────────────────────────────────────────────
  const availableSections = useMemo(() => {
    if (!layout) return ALL_SECTION_TYPES;
    const sections = (layout as unknown as PortfolioLayout).sections ?? [];
    const types = sections.map((s) => s.type);
    return ALL_SECTION_TYPES.filter((t) => types.includes(t));
  }, [layout]);

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

  // ── Save handlers ─────────────────────────────────────────────────────────
  const handleHeroSave = useCallback(async (updated: HeroData) => {
    await updatePortfolio(portfolioId, { layout: setSectionData(layout, "hero", updated) });
  }, [layout, portfolioId, updatePortfolio]);

  const handleBioSave = useCallback(async (updated: BioData) => {
    await updatePortfolio(portfolioId, { layout: setSectionData(layout, "bio", updated) });
  }, [layout, portfolioId, updatePortfolio]);

  const handleSkillsSave = useCallback(async (updated: SkillsData) => {
    await updatePortfolio(portfolioId, { layout: setSectionData(layout, "skills", updated) });
  }, [layout, portfolioId, updatePortfolio]);

  const handleExperienceSave = useCallback(async (updated: ExperienceData) => {
    await updatePortfolio(portfolioId, { layout: setSectionData(layout, "experience", updated) });
  }, [layout, portfolioId, updatePortfolio]);

  const handleEducationSave = useCallback(async (updated: EducationData) => {
    await updatePortfolio(portfolioId, { layout: setSectionData(layout, "education", updated) });
  }, [layout, portfolioId, updatePortfolio]);

  const handleCertificationSave = useCallback(async (updated: CertificationData) => {
    await updatePortfolio(portfolioId, { layout: setSectionData(layout, "certification", updated) });
  }, [layout, portfolioId, updatePortfolio]);

  const handleProjectsSave = useCallback(async (updated: ProjectsData) => {
    await updatePortfolio(portfolioId, { layout: setSectionData(layout, "projects", updated) });
  }, [layout, portfolioId, updatePortfolio]);

  const handleBlogsSave = useCallback(async (updated: BlogsData) => {
    await updatePortfolio(portfolioId, { layout: setSectionData(layout, "blogs", updated) });
  }, [layout, portfolioId, updatePortfolio]);

  const handleTestimonialsSave = useCallback(async (updated: TestimonialsData) => {
    await updatePortfolio(portfolioId, { layout: setSectionData(layout, "testimonials", updated) });
  }, [layout, portfolioId, updatePortfolio]);

  // ── Layout save ───────────────────────────────────────────────────────────
  // Called on every change from the layout editor (debounced at the controller
  // level). Theme is hoisted to layout.theme (top-level). liveVariant is kept
  // in sync so the ThemeToggle icon reflects the latest picked variant.
  const handleLayoutSave = useCallback(async (updated: LayoutData) => {
    const { theme, ...layoutWithoutTheme } = updated;
    if (theme?.themeVariant) {
      setLiveVariant(theme.themeVariant as "light" | "dark" | "system");
    }
    await updatePortfolio(portfolioId, {
      layout: {
        ...layout,
        layout: layoutWithoutTheme,
        ...(theme ? { theme } : {}),
      },
    });
  }, [layout, portfolioId, updatePortfolio]);

  // ── ThemeToggle variant change ────────────────────────────────────────────
  const handleThemeVariantChange = useCallback(async (variant: "light" | "dark" | "system") => {
    setLiveVariant(variant);
    await updatePortfolio(portfolioId, {
      layout: {
        ...layout,
        theme: {
          ...(savedTheme ?? {}),
          themeVariant: variant,
        },
      },
    });
  }, [layout, portfolioId, savedTheme, updatePortfolio]);

  const currentUsername = profileContext.username;

  if (!currentPortfolio) {
    return (
      <div className="flex items-center flex-col justify-center min-h-screen bg-[var(--pb-background)]">
        <PortfolioProLogo scale={0.7} />
        <p className="text-[var(--pb-text-muted)]">Loading portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--pb-background)]">
        <div className="text-center">
          <p className="text-[var(--pb-error)] mb-4">Failed to load portfolio</p>
          <p className="text-[var(--pb-text-muted)] text-sm">{error}</p>
          <button
            onClick={() => fetchPortfolioById(portfolioId)}
            className="px-6 py-3 mt-2 bg-[var(--pb-foreground)] text-[var(--pb-background)] rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const renderSection = (sectionType: string) => {
    switch (sectionType) {
      case "hero":
        return (
          <section id="hero" key="hero">
            <HeroSectionController heroData={heroData} onSave={handleHeroSave} theme={resolvedTheme} />
          </section>
        );
      case "bio":
        return (
          <section id="bio" key="bio">
            <BioSectionController bioData={bioData} onSave={handleBioSave} />
          </section>
        );
      case "skills":
        return (
          <section id="skills" key="skills">
            <SkillsSectionController skillsData={skillsData} onSave={handleSkillsSave} username={currentUsername || ""} />
          </section>
        );
      case "experience":
        return (
          <section id="experience" key="experience">
            <ExperienceSectionController experienceData={experienceData} onSave={handleExperienceSave} username={currentUsername || ""} />
          </section>
        );
      case "education":
        return (
          <section id="education" key="education">
            <EducationSectionController educationData={educationData} onSave={handleEducationSave} username={currentUsername || ""} />
          </section>
        );
      case "certification":
        return (
          <section id="certification" key="certification">
            <CertificationSectionController certificationData={certificationData} onSave={handleCertificationSave} username={currentUsername || ""} />
          </section>
        );
      case "projects":
        return (
          <section id="projects" key="projects">
            <ProjectsSectionController projectsData={projectsData} onSave={handleProjectsSave} username={currentUsername || ""} />
          </section>
        );
      case "blogs":
        return (
          <section id="blogs" key="blogs">
            <BlogsSectionController blogsData={blogsData} onSave={handleBlogsSave} username={currentUsername || ""} />
          </section>
        );
      case "testimonials":
        return (
          <section id="testimonials" key="testimonials">
            <TestimonialsSectionController testimonialsData={testimonialsData} onSave={handleTestimonialsSave} username={currentUsername || ""} />
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <ThemeToggleProvider
      themeVariant={liveVariant}
      setThemeVariant={handleThemeVariantChange}
    >
      <LayoutController
        layoutData={layoutData}
        onSave={handleLayoutSave}
        availableSections={availableSections}
        sectionLinks={sectionLinks}
      >
        {ALL_SECTION_TYPES.map((sectionType) => renderSection(sectionType))}
      </LayoutController>
    </ThemeToggleProvider>
  );
}