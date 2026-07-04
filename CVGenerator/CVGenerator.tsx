// components/CVGenerator/CVGenerator.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import CVConfig from "./CVConfig";
import CVPreview from "./CVPreview";
import { buildCVHtml } from "./cvHtmlBuilder";
import type { ComplexityMode, ToneMode, CVSource, CustomVisibilityConfig } from "./types";
import { COMPLEXITY_MODES, ALL_SECTIONS } from "./constants";

// Stores
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { useSocialLinks } from "@/lib/stores/social_links/useSocialLinks";
import { useExperiencesStore } from "@/lib/stores/experiences/useExperience";
import { useProjectStore } from "@/lib/stores/projects/useProjectsStore";
import { useCertifications } from "@/lib/stores/certifications/useCertifications";
import { useEducation } from "@/lib/stores/education/useEducation";
import { useSkills } from "@/lib/stores/skills/useSkills";
import { useTestimonialsStore } from "@/lib/stores/testimonials/useTestimonial";
import { usePortfolioStore } from "@/portfolio-builder/store/usePortfolioStore";

// Default sections to include
const DEFAULT_SECTIONS = [
  "bio", "experience", "education", "skills",
  "certifications", "projects", "testimonials", "social"
];

export default function CVGenerator() {
  const [step, setStep] = useState<"config" | "preview">("config");
  const [complexity, setComplexity] = useState<ComplexityMode>("standard");
  const [tone, setTone] = useState<ToneMode>("professional");
  const [sections, setSections] = useState<string[]>(DEFAULT_SECTIONS);
  const [source, setSource] = useState<CVSource>("default");
  const [selectedPortfolioSlug, setSelectedPortfolioSlug] = useState<string | null>(null);
  const [customVisibility, setCustomVisibility] = useState<CustomVisibilityConfig>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cvHtml, setCvHtml] = useState<string | null>(null);

  // ── Store hooks ────────────────────────────────────────────────────────

  // User settings / profile
  const profile = useUserSettings((state) => state.profile);
  const userInfo = useUserSettings((state) => state.userInfo);
  const fetchProfile = useUserSettings((state) => state.fetchProfile);

  // Social links
  const socialLinks = useSocialLinks((state) => state.socialLinks);
  const fetchAllSocialLinks = useSocialLinks((state) => state.fetchAllSocialLinks);

  // Experiences
  const myExperiences = useExperiencesStore((state) => state.myExperiences);
  const fetchMyExperiences = useExperiencesStore((state) => state.fetchMyExperiences);

  // Projects
  const projects = useProjectStore((state) => state.projects);
  const fetchMyProjects = useProjectStore((state) => state.fetchMyProjects);

  // Certifications
  const certifications = useCertifications((state) => state.certifications);
  const fetchAllCertifications = useCertifications((state) => state.fetchAllCertifications);

  // Education
  const educations = useEducation((state) => state.educations);
  const fetchAllEducations = useEducation((state) => state.fetchAllEducations);

  // Skills
  const skills = useSkills((state) => state.skills);
  const fetchAllSkills = useSkills((state) => state.fetchAllSkills);

  // Testimonials
  const myReceivedTestimonials = useTestimonialsStore((state) => state.myReceivedTestimonials);
  const fetchMyReceivedTestimonials = useTestimonialsStore((state) => state.fetchMyReceivedTestimonials);

  // Portfolios
  const portfolios = usePortfolioStore((state) => state.portfolios);
  const currentPortfolio = usePortfolioStore((state) => state.currentPortfolio);
  const portfolioLoading = usePortfolioStore((state) => state.isLoading);
  const portfolioError = usePortfolioStore((state) => state.error);
  const fetchMyPortfolios = usePortfolioStore((state) => state.fetchMyPortfolios);
  const fetchPortfolioById = usePortfolioStore((state) => state.fetchPortfolioById);

  // ── Load portfolios whenever the portfolio source is selected ───────
  useEffect(() => {
    if (source !== "portfolio") return;

    fetchMyPortfolios().catch((err) => {
      console.error(err);
      setError("Failed to load portfolios");
    });
  }, [source, fetchMyPortfolios]);

  // ── Handle portfolio selection ────────────────────────────────────────
  useEffect(() => {
    if (selectedPortfolioSlug && source === "portfolio") {
      fetchPortfolioById(selectedPortfolioSlug).catch((err) => {
        setError("Failed to load portfolio data");
        console.error(err);
      });
    }
  }, [selectedPortfolioSlug, source, fetchPortfolioById]);

  // ── Auto-select the first/default portfolio when available ───────────
  useEffect(() => {
    if (source !== "portfolio") return;

    if (!selectedPortfolioSlug && portfolios.length > 0) {
      const preferred = portfolios.find((portfolio) => portfolio.is_default) ?? portfolios[0];
      setSelectedPortfolioSlug(preferred?.slug ?? null);
    }
  }, [source, portfolios, selectedPortfolioSlug]);

  // ── Sync sections when portfolio changes ──────────────────────────────
  useEffect(() => {
    if (source === "portfolio" && currentPortfolio?.layout?.sections) {
      const layoutSections = currentPortfolio.layout.sections as Array<{ type: string }>;
      const availableTypes = layoutSections.map((s) => s.type);

      // Map portfolio section types to CV section IDs
      const sectionMap: Record<string, string> = {
        "bio": "bio",
        "experience": "experience",
        "education": "education",
        "skills": "skills",
        "certification": "certifications",
        "projects": "projects",
        "testimonials": "testimonials",
        "hero": "social", // hero contains social links
      };

      const derivedSections = availableTypes
        .map((type) => sectionMap[type])
        .filter(Boolean) as string[];

      // Ensure social is included if hero is present
      if (availableTypes.includes("hero") && !derivedSections.includes("social")) {
        derivedSections.push("social");
      }

      // Merge with defaults, keeping user selections
      const merged = [...new Set([...derivedSections, ...sections.filter((s) => DEFAULT_SECTIONS.includes(s))])];
      setSections(merged);
    }
  }, [currentPortfolio, source]);

  // ── Generate CV ──────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Fetch only data that hasn't been fetched yet (empty stores)
      const fetchPromises: Promise<any>[] = [];

      // Fetch profile if it's missing. Note: userInfo (name/email/username)
      // is often already populated app-wide from auth/session, but profile
      // (bio, job_title, open_to_work, years_of_experience, phone,
      // location) only loads via this call — so we must not skip it just
      // because userInfo happens to already be set, or bio and friends
      // will silently stay empty for the whole session.
      if (!profile) {
        fetchPromises.push(fetchProfile());
      }

      // Fetch experiences only if empty
      if (sections.includes("experience") && myExperiences.length === 0) {
        fetchPromises.push(fetchMyExperiences());
      }

      // Fetch projects only if empty
      if (sections.includes("projects") && projects.length === 0) {
        fetchPromises.push(fetchMyProjects({ include_public: true }));
      }

      // Fetch certifications only if empty
      if (sections.includes("certifications") && certifications.length === 0) {
        fetchPromises.push(fetchAllCertifications());
      }

      // Fetch education only if empty
      if (sections.includes("education") && educations.length === 0) {
        fetchPromises.push(fetchAllEducations());
      }

      // Fetch skills only if empty
      if (sections.includes("skills") && skills.length === 0) {
        fetchPromises.push(fetchAllSkills());
      }

      // Fetch testimonials only if empty
      if (sections.includes("testimonials") && myReceivedTestimonials.length === 0) {
        fetchPromises.push(fetchMyReceivedTestimonials());
      }

      // Fetch social links only if empty
      if (sections.includes("social") && source === "default" && socialLinks.length === 0) {
        fetchPromises.push(fetchAllSocialLinks());
      }

      // Wait for all needed fetches to complete
      if (fetchPromises.length > 0) {
        await Promise.all(fetchPromises);
      }

      // Step 2: Get current state from all stores
      const currentProfile = useUserSettings.getState().profile;
      const currentUserInfo = useUserSettings.getState().userInfo;
      const currentSocialLinks = useSocialLinks.getState().socialLinks;
      const currentExperiences = useExperiencesStore.getState().myExperiences;
      const currentProjects = useProjectStore.getState().projects;
      const currentCertifications = useCertifications.getState().certifications;
      const currentEducations = useEducation.getState().educations;
      const currentSkills = useSkills.getState().skills;
      const currentTestimonials = useTestimonialsStore.getState().myReceivedTestimonials;
      const currentPortfolio = usePortfolioStore.getState().currentPortfolio;

      // Step 3: Validate we have the required data
      if (!currentProfile && !currentUserInfo) {
        throw new Error("No profile found. Please set up your profile first.");
      }

      // Step 4: Build normalized profile
      let cvProfile = buildNormalizedProfile(
        currentProfile,
        currentUserInfo,
        currentSocialLinks,
        currentExperiences,
        currentEducations,
        currentSkills,
        currentCertifications,
        source,
        currentPortfolio
      );

      // Step 5: Get portfolio layout if applicable
      const portfolioLayout = source === "portfolio" && currentPortfolio
        ? currentPortfolio.layout
        : null;

      // Step 6: Normalize projects for CV builder
      const normalizedProjects = currentProjects.map((p: any) => {
        const projectSlug = p.slug;

        if (!projectSlug) {
          console.warn('Project missing slug:', p);
        }

        return {
          id: projectSlug || 'unknown',
          title: p.project_name || p.title || "Untitled Project",
          summary: p.project_summary || p.summary || "",
          description: p.description || p.project_summary || p.summary || "",
          liveUrl: p.project_url || p.liveUrl || null,
          repoUrl: p.other_project_url?.github || p.repoUrl || null,
          tags: p.tags || p.stack || [],
          featured: p.is_featured || p.featured || false,
          is_featured: p.is_featured || p.featured || false,
          // Preserved so portfolio-layout project filters can still match
          // after normalization.
          category: p.project_category || p.category || "",
          project_category: p.project_category || p.category || "",
          project_platform: p.project_platform || "",
          status: p.status || "",
          is_completed: p.is_completed ?? undefined,
          is_concept: p.is_concept ?? undefined,
        };
      });

      // Step 7: Normalize testimonials
      const normalizedTestimonials = currentTestimonials.map((t: any) => ({
        id: t.id,
        name: t.author_name || t.name || "Anonymous",
        role: t.author_title || t.role || "",
        company: t.author_company || t.company || "",
        content: t.content || "",
        rating: t.rating || 5,
      }));

      // Step 8: Generate the CV HTML
      const html = buildCVHtml({
        profile: cvProfile,
        projects: normalizedProjects,
        testimonials: normalizedTestimonials,
        certifications: currentCertifications,
        config: complexity,
        tone,
        sections,
        portfolioLayout: portfolioLayout || undefined,
        customVisibility,
      });

      setCvHtml(html);
      setStep("preview");

    } catch (e: any) {
      console.error("CV Generation Error:", e);
      setError(e.message || "Failed to generate CV. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    complexity, tone, sections, source, selectedPortfolioSlug, customVisibility,
    profile, userInfo, myExperiences, projects, certifications,
    educations, skills, myReceivedTestimonials, socialLinks,
    fetchProfile, fetchMyExperiences, fetchMyProjects, fetchAllCertifications,
    fetchAllEducations, fetchAllSkills, fetchMyReceivedTestimonials, fetchAllSocialLinks
  ]);

  const handleReconfigure = useCallback(() => {
    setStep("config");
    setCvHtml(null);
    setError(null);
  }, []);

  if (step === "config") {
    return (
      <CVConfig
        complexity={complexity}
        tone={tone}
        sections={sections}
        source={source}
        selectedPortfolioId={selectedPortfolioSlug}
        loading={loading}
        error={error}
        portfolios={portfolios}
        portfolioLoading={portfolioLoading}
        portfolioError={portfolioError}
        customVisibility={customVisibility}
        onComplexityChange={setComplexity}
        onToneChange={setTone}
        onSectionsChange={setSections}
        onSourceChange={(newSource) => {
          setSource(newSource);
          if (newSource === "default") {
            setSelectedPortfolioSlug(null);
            // Portfolio sync (see effect above) can drop sections like "bio"
            // that weren't present in that portfolio's layout. Restore the
            // full default set when going back to the default source so
            // nothing stays silently excluded.
            setSections(DEFAULT_SECTIONS);
          }
        }}
        onPortfolioChange={setSelectedPortfolioSlug}
        onCustomVisibilityChange={setCustomVisibility}
        onGenerate={handleGenerate}
      />
    );
  }

  return (
    <CVPreview
      cvHtml={cvHtml}
      complexity={complexity}
      tone={tone}
      sections={sections}
      source={source}
      error={error}
      onReconfigure={handleReconfigure}
      profileName={profile?.job_title || userInfo?.firstname || "CV"}
    />
  );
}

// ── Helper: Build normalized profile ───────────────────────────────────────
function buildNormalizedProfile(
  profile: any,
  userInfo: any,
  socialLinks: any[],
  experiences: any[],
  educations: any[],
  skills: any[],
  certifications: any[],
  source: CVSource,
  portfolio: any,
): any {

  let name = "";
  let headline = "";
  let email = "";
  let bio = "";
  let availableForWork = false;
  let availabilityNote = "";
  let yearsExperience = 0;
  let location = "";

  // Portfolio hero data takes priority when portfolio source is selected
  if (source === "portfolio" && portfolio?.layout?.sections) {
    const heroSection = portfolio.layout.sections.find((s: any) => s.type === "hero");
    const bioSection = portfolio.layout.sections.find((s: any) => s.type === "bio");

    if (heroSection?.data) {
      name = heroSection.data.name || "";
      headline = heroSection.data.title || heroSection.data.headline || "";
      email = heroSection.data.email || "";
      location = heroSection.data.location || "";

      // Portfolio hero data typically stores email inside socialLinks
      // (platformId: "Email") rather than as a top-level field.
      if (!email && Array.isArray(heroSection.data.socialLinks)) {
        const emailLink = heroSection.data.socialLinks.find(
          (sl: any) => (sl.platformId || sl.platform || "").toLowerCase() === "email"
        );
        if (emailLink?.url) email = emailLink.url;
      }
    }

    if (bioSection?.data) {
      bio = bioSection.data.bio || "";
      availableForWork = bioSection.data.status?.type === "open-to-work" || false;
      availabilityNote = bioSection.data.status?.note || "";
      yearsExperience = bioSection.data.yearsExperience || 0;

      // Location typically lives on the bio section, not hero — only
      // fall back to it if hero didn't provide one.
      if (!location && bioSection.data.location) {
        location = bioSection.data.location;
      }
    }
  }

  // Fallback to store data if portfolio data is missing
  if (!name && userInfo) {
    const parts = [userInfo.firstname, userInfo.middlename, userInfo.lastname].filter(Boolean);
    name = parts.join(" ") || userInfo.username || "";
  }
  if (!name && profile) {
    name = profile.profession || "";
  }

  if (!headline && profile) {
    headline = profile.job_title || profile.profession || "";
  }

  if (!email && userInfo) {
    email = userInfo.email || "";
  }

  if (!bio && profile) {
    bio = profile.bio || "";
  }

  if (!availableForWork && profile) {
    availableForWork = profile.open_to_work || false;
  }

  if (!availabilityNote && profile) {
    availabilityNote = profile.availability || "";
  }

  if (!yearsExperience && profile) {
    yearsExperience = profile.years_of_experience || 0;
  }

  // Extract phone
  let phone = "";
  if (source === "portfolio" && portfolio?.layout?.sections) {
    const heroSection = portfolio.layout.sections.find((s: any) => s.type === "hero");
    if (heroSection?.data?.phone) {
      phone = heroSection.data.phone;
    }
  }
  if (!phone && userInfo) {
    phone = userInfo.phone || "";
  }
  if (!phone && profile) {
    phone = profile.phone || "";
  }

  // Parse location
  let city = "", state = "", country = "";
  if (location) {
    const locParts = location.split(",").map((s: string) => s.trim());
    if (locParts.length >= 3) {
      city = locParts[0];
      state = locParts[1];
      country = locParts[2];
    } else if (locParts.length === 2) {
      city = locParts[0];
      state = locParts[1];
    } else if (locParts.length === 1) {
      city = locParts[0];
    }
  } else if (profile?.location) {
    const locParts = profile.location.split(",").map((s: string) => s.trim());
    if (locParts.length >= 3) {
      city = locParts[0];
      state = locParts[1];
      country = locParts[2];
    } else if (locParts.length === 2) {
      city = locParts[0];
      state = locParts[1];
    } else if (locParts.length === 1) {
      city = locParts[0];
    }
  }

  // Normalize social links
  let normalizedSocialLinks = socialLinks.map((sl: any) => ({
    platform: sl.platform_name || sl.platform || "Link",
    url: sl.profile_url || sl.url || "#",
  }));

  // If portfolio source and hero has social links, use those instead
  if (source === "portfolio") {
    const heroSection = portfolio?.layout?.sections?.find((s: any) => s.type === "hero");
    if (heroSection?.data?.socialLinks && Array.isArray(heroSection.data.socialLinks)) {
      normalizedSocialLinks = heroSection.data.socialLinks.map((sl: any) => ({
        platform: sl.platformId || sl.platform || "Link",
        url: sl.url || "#",
      }));
    }
  }

  // Normalize experiences
  const normalizedExperiences = experiences.map((exp: any) => ({
    id: exp.id,
    role: exp.job_title || exp.role || "",
    company: exp.company_name || exp.company || "",
    location: exp.location || "",
    startDate: exp.start_date || exp.startDate || "",
    endDate: exp.end_date || exp.endDate || "",
    current: exp.is_current || exp.current || false,
    description: exp.description || "",
    // Preserved so portfolio-layout filters (employment_type, location_type,
    // industry, is_featured) can still match after normalization.
    employment_type: exp.employment_type || exp.employmentType || "",
    location_type: exp.location_type || exp.locationType || "",
    industry: exp.industry || "",
    is_featured: exp.is_featured || exp.featured || false,
  }));

  // Normalize educations
  const normalizedEducations = educations.map((edu: any) => ({
    id: edu.id,
    degree: edu.degree || "",
    field: edu.field_of_study || edu.field || "",
    institution: edu.institution || "",
    startYear: edu.start_year || edu.startYear || "",
    endYear: edu.end_year || edu.endYear || "",
    current: edu.is_current || edu.current || false,
    description: edu.description || "",
  }));

  // Normalize skills
  const normalizedSkills = skills.map((sk: any) => ({
    id: sk.id,
    name: sk.skill_name || sk.name || "",
    proficiency: sk.proficiency_level || sk.proficiency || "Intermediate",
    category: sk.category || "General",
    is_major: sk.is_major ?? false,
  }));

  return {
    name,
    headline,
    email,
    phone,
    city,
    state,
    country,
    bio,
    availableForWork,
    availabilityNote,
    yearsExperience,
    socialLinks: normalizedSocialLinks,
    experiences: normalizedExperiences,
    educations: normalizedEducations,
    skills: normalizedSkills,
    certifications,
  };
}