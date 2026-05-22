// portfolio-builder/components/PortfolioMain.tsx

"use client";

import { useEffect } from "react";
import { usePortfolioStore } from "@/portfolio-builder/store/usePortfolioStore";
import HeroSectionController from "@/portfolio-builder/components/sections/hero/HeroSectionController";
import PortfolioProLogo from "@/src/app/components/logo/PortfolioProTextLogo";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PortfolioMainProps {
  portfolioId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PortfolioMain({ portfolioId }: PortfolioMainProps) {
  const { currentPortfolio, isLoading, error, fetchPortfolioById } =
    usePortfolioStore();

  // Fetch the portfolio on mount (or when portfolioId changes)
  useEffect(() => {
    fetchPortfolioById(portfolioId);
  }, [portfolioId]);

  // ---- Loading -------------------------------------------------------------
  if (isLoading || !currentPortfolio) {
    return (
      <div className="flex items-center flex-col justify-center min-h-screen bg-neutral-950">
        <PortfolioProLogo scale={0.7}/>
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
  return (
    <div className="min-h-screen bg-neutral-950">
      <HeroSectionController
        portfolioId={currentPortfolio.id}
        layout={currentPortfolio.layout}
      />

      {/*
        Future sections:
        <SkillsSectionController portfolioId={...} layout={...} />
        <ExperienceSectionController portfolioId={...} layout={...} />
        <ProjectsSectionController portfolioId={...} layout={...} />
      */}
    </div>
  );
}