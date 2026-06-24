"use client";

import { useEffect, useMemo, useCallback } from "react";
import { usePortfolioStore } from "@/portfolio-builder/store/usePortfolioStore";
import HeroSectionController from "@/portfolio-builder/components/sections/hero/HeroSectionController";
import BioSectionController from "@/portfolio-builder/components/sections/bio/BioSectionController";
import PortfolioProLogo from "@/src/app/components/logo/PortfolioProTextLogo";
import { HeroData } from "@/portfolio-builder/types/hero";
import { BioData } from "@/portfolio-builder/types/bio";
import { usePortfolioTheme, PortfolioThemeData } from "@/portfolio-builder/hooks/usePortfolioTheme";
import "@/portfolio-builder/styles/portfolio-theme.css";
import { SkillsSectionController } from "./sections/skills";
import { SkillsData } from "../types/skills";
import { ExperienceSectionController } from "./sections/experience";
import { ExperienceData } from "../types/experience";
import { useTheme } from "@/src/app/components/theme/ThemeContext ";

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
  return { sections };
}

export default function PortfolioMain({ portfolioId }: PortfolioMainProps) {
  const { currentPortfolio, isLoading, error, fetchPortfolioById, updatePortfolio } =
    usePortfolioStore();
  const { profileContext } = useTheme();

  useEffect(() => {
    fetchPortfolioById(portfolioId);
  }, [portfolioId]);

  const layout = currentPortfolio?.layout ?? null;

  const themeData = useMemo(
    () => getTopLevelData<PortfolioThemeData>(layout, "theme"),
    [layout]
  );
  const resolvedTheme = usePortfolioTheme(themeData);

  // ── Stable section data — only changes when layout actually changes ───────
  const heroData = useMemo(() => getSectionData<HeroData>(layout, "hero"), [layout]);
  const bioData = useMemo(() => getSectionData<BioData>(layout, "bio"), [layout]);
  const skillsData = useMemo(() => getSectionData<SkillsData>(layout, "skills"), [layout]);
  const experienceData = useMemo(() => getSectionData<ExperienceData>(layout, "experience"), [layout]);

  // ── Stable handlers — only change when their dependencies change ──────────
  const handleHeroSave = useCallback(async (updatedHeroData: HeroData) => {
    const newLayout = setSectionData(layout, "hero", updatedHeroData);
    await updatePortfolio(portfolioId, { layout: newLayout });
  }, [layout, portfolioId, updatePortfolio]);

  const handleBioSave = useCallback(async (updatedBioData: BioData) => {
    const newLayout = setSectionData(layout, "bio", updatedBioData);
    await updatePortfolio(portfolioId, { layout: newLayout });
  }, [layout, portfolioId, updatePortfolio]);

  const handleSkillsSave = useCallback(async (updated: SkillsData) => {
    const newLayout = setSectionData(layout, "skills", updated);
    await updatePortfolio(portfolioId, { layout: newLayout });
  }, [layout, portfolioId, updatePortfolio]);

  const handleExperienceSave = useCallback(async (updated: ExperienceData) => {
    const newLayout = setSectionData(layout, "experience", updated);
    await updatePortfolio(portfolioId, { layout: newLayout });
  }, [layout, portfolioId, updatePortfolio]);

  const currentUsername = profileContext.username;

  if (isLoading || !currentPortfolio) {
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

  return (
    <div className="min-h-screen bg-[var(--pb-background)]">
      <HeroSectionController heroData={heroData} onSave={handleHeroSave} theme={resolvedTheme} />
      <BioSectionController bioData={bioData} onSave={handleBioSave} />
      <SkillsSectionController
        skillsData={skillsData}
        onSave={handleSkillsSave}
        username={currentUsername || ""}
      />
      <ExperienceSectionController
        experienceData={experienceData}
        onSave={handleExperienceSave}
        username={currentUsername || ""}
      />
    </div>
  );
}