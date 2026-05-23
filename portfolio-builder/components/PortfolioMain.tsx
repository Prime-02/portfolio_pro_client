// portfolio-builder/components/PortfolioMain.tsx

"use client";

import { useEffect } from "react";
import { usePortfolioStore } from "@/portfolio-builder/store/usePortfolioStore";
import HeroSectionController from "@/portfolio-builder/components/sections/hero/HeroSectionController";
import BioSectionController from "@/portfolio-builder/components/sections/bio/BioSectionController";
import PortfolioProLogo from "@/src/app/components/logo/PortfolioProTextLogo";
import { HeroData } from "@/portfolio-builder/types/hero";
import { BioData } from "@/portfolio-builder/types/bio";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PortfolioMainProps {
  portfolioId: string;
}

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PortfolioMain({ portfolioId }: PortfolioMainProps) {
  const { currentPortfolio, isLoading, error, fetchPortfolioById, updatePortfolio } =
    usePortfolioStore();

  // Fetch the portfolio on mount (or when portfolioId changes)
  useEffect(() => {
    fetchPortfolioById(portfolioId);
  }, [portfolioId]);

  // ---- Loading -------------------------------------------------------------
  if (isLoading || !currentPortfolio) {
    return (
      <div className="flex items-center flex-col justify-center min-h-screen bg-neutral-950">
        <PortfolioProLogo scale={0.7} />
        <p className="text-neutral-400">Loading portfolio...</p>
      </div>
    );
  }

  // ---- Error ---------------------------------------------------------------
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load portfolio</p>
          <p className="text-neutral-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // ---- Build mode — render sections ----------------------------------------
  const heroData = getSectionData<HeroData>(currentPortfolio.layout, "hero");
  const bioData = getSectionData<BioData>(currentPortfolio.layout, "bio");

  const handleHeroSave = async (updatedHeroData: HeroData) => {
    const newLayout = setSectionData(currentPortfolio.layout, "hero", updatedHeroData);
    await updatePortfolio(portfolioId, { layout: newLayout });
  };

  const handleBioSave = async (updatedBioData: BioData) => {
    const newLayout = setSectionData(currentPortfolio.layout, "bio", updatedBioData);
    await updatePortfolio(portfolioId, { layout: newLayout });
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <HeroSectionController heroData={heroData} onSave={handleHeroSave} />
      <BioSectionController bioData={bioData} onSave={handleBioSave} />

      {/*
        Future sections:
        <SkillsSectionController portfolioId={...} layout={...} />
        <ExperienceSectionController portfolioId={...} layout={...} />
        <ProjectsSectionController portfolioId={...} layout={...} />
      */}
    </div>
  );
}
