"use client";

import { useEffect, useMemo, useCallback } from "react";
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
import { useTheme } from "@/src/context/ThemeContext";
import { ProjectsData } from "../types/projects";
import { ProjectsSectionController } from "./sections/projects";
import { BlogsData } from "../types/blogs";
import { BlogsSectionController } from "./sections/blogs";
import { TestimonialsData } from "../types/testimonials";
import { TestimonialsSectionController } from "./sections/testimonials";
import { LayoutController } from "./sections/layout";
import { toast } from "@/src/context/Toastify";

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
  const { currentPortfolio, error, fetchPortfolioById, updatePortfolio, updateSectionsLocally } =
    usePortfolioStore();
  const { profileContext } = useTheme();

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
    fetchPortfolioById(portfolioId);
  }, [portfolioId]);

  // usePortfolioTheme now reads from the store itself — no args needed.
  // It handles CSS injection whenever currentPortfolio.layout.theme changes,
  // whether from ThemeToggle, ThemeTab, or a fresh fetch.
  const resolvedTheme = usePortfolioTheme();

  const layout = currentPortfolio?.layout ?? null;

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
  // Persists the layout structure (navbar, footer, etc.) alongside whatever
  // theme is currently in the store (from local toggle/tab changes).
  // Theme is stored top-level at layout.theme, layout structure at layout.layout.
  const handleLayoutSave = useCallback(async (updated: LayoutData) => {
    const currentTheme = (layout?.theme ?? {}) as PortfolioThemeData;
    await updatePortfolio(portfolioId, {
      layout: {
        ...layout,
        layout: updated,        // persist the navbar/footer/background draft
        theme: currentTheme,    // persist whatever theme is in the store right now
      },
    });
  }, [layout, portfolioId, updatePortfolio]);

  // ── Add section ───────────────────────────────────────────────────────────
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

  if (!currentPortfolio) {
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
            <HeroSectionController heroData={heroData} viewOnly={viewOnly} onSave={handleHeroSave} theme={resolvedTheme} />
          </section>
        );
      case "bio":
        return (
          <section id="bio" key="bio">
            <BioSectionController bioData={bioData} viewOnly={viewOnly} onSave={handleBioSave} />
          </section>
        );
      case "skills":
        return (
          <section id="skills" key="skills">
            <SkillsSectionController skillsData={skillsData} viewOnly={viewOnly} onSave={handleSkillsSave} username={currentUsername || ""} />
          </section>
        );
      case "experience":
        return (
          <section id="experience" key="experience">
            <ExperienceSectionController experienceData={experienceData} viewOnly={viewOnly} onSave={handleExperienceSave} username={currentUsername || ""} />
          </section>
        );
      case "education":
        return (
          <section id="education" key="education">
            <EducationSectionController educationData={educationData} viewOnly={viewOnly} onSave={handleEducationSave} username={currentUsername || ""} />
          </section>
        );
      case "certification":
        return (
          <section id="certification" key="certification">
            <CertificationSectionController certificationData={certificationData} viewOnly={viewOnly} onSave={handleCertificationSave} username={currentUsername || ""} />
          </section>
        );
      case "projects":
        return (
          <section id="projects" key="projects">
            <ProjectsSectionController projectsData={projectsData} viewOnly={viewOnly} onSave={handleProjectsSave} username={currentUsername || ""} />
          </section>
        );
      case "blogs":
        return (
          <section id="blogs" key="blogs">
            <BlogsSectionController blogsData={blogsData} viewOnly={viewOnly} onSave={handleBlogsSave} username={currentUsername || ""} />
          </section>
        );
      case "testimonials":
        return (
          <section id="testimonials" key="testimonials">
            <TestimonialsSectionController testimonialsData={testimonialsData} viewOnly={viewOnly} onSave={handleTestimonialsSave} username={currentUsername || ""} />
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <LayoutController
      layoutData={layoutData}
      viewOnly={viewOnly} onSave={handleLayoutSave}
      availableSections={availableSections}
      sectionLinks={sectionLinks}
      missingSections={missingSections}
      onAddSection={handleAddSection}
      onRemoveSection={handleRemoveSection}
    >
      {ALL_SECTION_TYPES.map((sectionType) => renderSection(sectionType))}
    </LayoutController>
  );
}