// components/CVGenerator/cvHtmlBuilder/index.ts
import { COMPLEXITY_MODES } from "../constants";
import { generateBaseStyles } from "./styles";
import {
  buildBioSection,
  buildExperienceSection,
  buildEducationSection,
  buildCertificationsSection,
  buildSkillsSection,
  buildProjectsSection,
  buildTestimonialsSection,
  buildSocialSection,
} from "./sections";
import { escapeHtml } from "./utils";
import type {
  BuildCVHtmlParams,
  PortfolioSectionData,
  CVProfile,
} from "./types";

/**
 * Merge Custom-mode field-visibility overrides on top of whatever
 * PortfolioSectionData was derived from the portfolio layout (if any).
 * Custom overrides win on a per-key basis; any key they don't specify
 * falls back to the portfolio-derived value (or the all-visible default).
 */
function withCustomVisibility(
  base: PortfolioSectionData | undefined,
  overrides: Record<string, boolean> | undefined,
): PortfolioSectionData | undefined {
  if (!overrides) return base;
  return {
    type: base?.type ?? "",
    data: { ...(base?.data || {}), ...overrides },
  };
}

export { mdToHtml, stripMd, fmtDate, PROFICIENCY_MAP } from "./utils";

/**
 * Extract portfolio section config by type
 */
function getPortfolioSection(
  layout: PortfolioSectionData[] | undefined,
  type: string,
): PortfolioSectionData | undefined {
  if (!layout || !Array.isArray(layout)) return undefined;
  return layout.find((s: any) => s.type === type);
}

/**
 * Apply portfolio filters to data arrays.
 *
 * Each filter is evaluated independently (no coupling with merge_filters).
 * The `merge_filters` flag is respected only for the legacy `is_major` filter
 * to preserve backward-compatibility with existing portfolios that relied on
 * the old coupled behaviour. All other filters work standalone.
 */
function applyPortfolioFilters(
  data: any[],
  sectionData: PortfolioSectionData | undefined,
): any[] {
  if (
    !sectionData?.data?.filters ||
    typeof sectionData.data.filters !== "object"
  ) {
    return data;
  }

  const filters = sectionData.data.filters as Record<string, unknown>;
  let result = [...data];

  // Legacy: is_major used to require merge_filters === true. We now support
  // both the standalone form (is_major: true) and the legacy coupled form
  // (is_major: true && merge_filters: true) so existing portfolios keep
  // working while new ones can use the simpler config.
  if (filters.is_major === true) {
    result = result.filter((item) => item.is_major === true);
  }

  // Apply is_featured filter for experiences
  if (filters.is_featured === true) {
    result = result.filter(
      (item) => item.is_featured === true || item.featured === true,
    );
  }

  // Apply is_current filter for experiences
  if (filters.is_current === true) {
    result = result.filter(
      (item) => item.is_current === true || item.current === true,
    );
  }

  // Apply employment_type filter
  if (filters.employment_type && typeof filters.employment_type === "string") {
    result = result.filter(
      (item) =>
        item.employment_type === filters.employment_type ||
        item.employmentType === filters.employment_type,
    );
  }

  // Apply location_type filter
  if (filters.location_type && typeof filters.location_type === "string") {
    result = result.filter(
      (item) =>
        item.location_type === filters.location_type ||
        item.locationType === filters.location_type,
    );
  }

  // Apply industry filter
  if (filters.industry && typeof filters.industry === "string") {
    result = result.filter((item) => item.industry === filters.industry);
  }

  // Apply is_completed filter for projects
  if (filters.is_completed !== undefined) {
    result = result.filter(
      (item) => item.is_completed === filters.is_completed,
    );
  }

  // Apply is_concept filter for projects
  if (filters.is_concept !== undefined) {
    result = result.filter((item) => item.is_concept === filters.is_concept);
  }

  // Apply project_category filter
  if (
    filters.project_category &&
    typeof filters.project_category === "string"
  ) {
    result = result.filter(
      (item) =>
        item.project_category === filters.project_category ||
        item.category === filters.project_category,
    );
  }

  // Apply project_platform filter
  if (
    filters.project_platform &&
    typeof filters.project_platform === "string"
  ) {
    result = result.filter(
      (item) => item.project_platform === filters.project_platform,
    );
  }

  // Apply project_status filter
  if (filters.project_status && typeof filters.project_status === "string") {
    result = result.filter((item) => item.status === filters.project_status);
  }

  // Apply ids filter (whitelist)
  if (filters.ids && Array.isArray(filters.ids) && filters.ids.length > 0) {
    const allowedIds = filters.ids as Array<string | number>;
    result = result.filter((item) => allowedIds.includes(item.id));
  }

  // Apply issuing_organization filter for certifications
  if (
    filters.issuing_organization &&
    typeof filters.issuing_organization === "string"
  ) {
    result = result.filter(
      (item) => item.issuing_organization === filters.issuing_organization,
    );
  }

  // Apply _sortBy for sorting
  if (filters._sortBy === "date-desc") {
    result.sort((a, b) => {
      const dateA = new Date(a.start_date || a.startDate || a.created_at || 0);
      const dateB = new Date(b.start_date || b.startDate || b.created_at || 0);
      return dateB.getTime() - dateA.getTime();
    });
  } else if (filters._sortBy === "date-asc") {
    result.sort((a, b) => {
      const dateA = new Date(a.start_date || a.startDate || a.created_at || 0);
      const dateB = new Date(b.start_date || b.startDate || b.created_at || 0);
      return dateA.getTime() - dateB.getTime();
    });
  }

  return result;
}

/**
 * Resolve a section's display title/subheadline from the portfolio layout,
 * falling back to the given defaults when the portfolio doesn't define them.
 */
function getSectionHeader(
  layout: PortfolioSectionData[] | undefined,
  type: string,
  fallbackTitle: string,
): { title: string; subheadline?: string } {
  const sectionData = getPortfolioSection(layout, type);
  const data = sectionData?.data as Record<string, unknown> | undefined;

  const headline =
    typeof data?.headline === "string" && data.headline.trim()
      ? data.headline.trim()
      : undefined;
  const subheadline =
    typeof data?.subheadline === "string" && data.subheadline.trim()
      ? data.subheadline.trim()
      : undefined;

  return { title: headline || fallbackTitle, subheadline };
}

/**
 * Build mailto: or tel: links for contact info in the header.
 */
function buildContactLink(type: "email" | "phone", value: string): string {
  if (!value) return "";
  const href = type === "email" ? `mailto:${value}` : `tel:${value}`;
  const icon = type === "email" ? "✉" : "📞";
  return `<span><a href="${escapeHtml(href)}">${icon} ${escapeHtml(value)}</a></span>`;
}

export function buildCVHtml({
  profile,
  projects,
  testimonials,
  certifications,
  config,
  tone,
  sections,
  portfolioLayout,
  customVisibility,
}: BuildCVHtmlParams): string {
  const mode =
    COMPLEXITY_MODES.find((m: any) => m.id === config) || COMPLEXITY_MODES[1];

  // Apply portfolio filters if available
  let filteredExperiences = profile.experiences || [];
  let filteredEducations = profile.educations || [];
  let filteredSkills = profile.skills || [];
  let filteredCertifications = certifications || [];
  let filteredProjects = projects || [];
  let filteredTestimonials = testimonials || [];
  let filteredSocialLinks = profile.socialLinks || [];

  const layoutSections = portfolioLayout?.sections;

  if (layoutSections) {
    const expSection = getPortfolioSection(layoutSections, "experience");
    filteredExperiences = applyPortfolioFilters(
      filteredExperiences,
      expSection,
    );

    const eduSection = getPortfolioSection(layoutSections, "education");
    filteredEducations = applyPortfolioFilters(filteredEducations, eduSection);

    const skillsSection = getPortfolioSection(layoutSections, "skills");
    filteredSkills = applyPortfolioFilters(filteredSkills, skillsSection);

    const certSection = getPortfolioSection(layoutSections, "certification");
    filteredCertifications = applyPortfolioFilters(
      filteredCertifications,
      certSection,
    );

    const projSection = getPortfolioSection(layoutSections, "projects");
    filteredProjects = applyPortfolioFilters(filteredProjects, projSection);

    const testSection = getPortfolioSection(layoutSections, "testimonials");
    filteredTestimonials = applyPortfolioFilters(
      filteredTestimonials,
      testSection,
    );

    // Social links from portfolio hero section take priority
    const heroSection = getPortfolioSection(layoutSections, "hero");
    if (
      heroSection?.data?.socialLinks &&
      Array.isArray(heroSection.data.socialLinks)
    ) {
      filteredSocialLinks = (heroSection.data.socialLinks as any[]).map(
        (sl: any) => ({
          platform: sl.platformId || sl.platform || "Link",
          url: sl.url || "#",
        }),
      );
    }
  }

  // Apply complexity mode limits
  const limitedExperiences = mode.maxExperience
    ? filteredExperiences.slice(0, mode.maxExperience)
    : filteredExperiences;

  const limitedEducations = mode.maxEducation
    ? filteredEducations.slice(0, mode.maxEducation)
    : filteredEducations;

  const limitedCertifications = filteredCertifications;

  // Apply project strategy
  let strategyProjects = filteredProjects;
  if (mode.projectStrategy === "featured") {
    strategyProjects = filteredProjects.filter(
      (p: any) => p.featured || p.is_featured,
    );
    if (strategyProjects.length === 0) {
      strategyProjects = filteredProjects.slice(0, 3);
    }
  } else if (mode.projectStrategy === "page") {
    strategyProjects = filteredProjects.slice(0, 6);
  }

  const limitedTestimonials =
    mode.maxTestimonials > 0
      ? filteredTestimonials.slice(0, mode.maxTestimonials)
      : [];

  // Build profile with filtered data
  const buildProfile: CVProfile = {
    ...profile,
    experiences: limitedExperiences,
    educations: limitedEducations,
    skills: filteredSkills,
    certifications: limitedCertifications,
    socialLinks: filteredSocialLinks,
  };

  const loc = [profile.city, profile.state, profile.country]
    .filter(Boolean)
    .join(", ");

  const baseStyle = generateBaseStyles(tone);

  // Resolve section titles/subheadlines
  const bioHeader = getSectionHeader(layoutSections, "bio", "Summary");
  const expHeader = getSectionHeader(
    layoutSections,
    "experience",
    "Experience",
  );
  const eduHeader = getSectionHeader(layoutSections, "education", "Education");
  const certHeader = getSectionHeader(
    layoutSections,
    "certification",
    "Certifications",
  );
  const skillsHeader = getSectionHeader(layoutSections, "skills", "Skills");
  const projectsHeader = getSectionHeader(
    layoutSections,
    "projects",
    "Projects",
  );
  const testimonialsHeader = getSectionHeader(
    layoutSections,
    "testimonials",
    "Testimonials",
  );

  // Resolve portfolio section data for visibility flags, then layer any
  // Custom-mode field-visibility overrides on top (Custom mode only —
  // customVisibility is ignored for every other complexity).
  const isCustomMode = mode.id === "custom";
  const bioSection = getPortfolioSection(layoutSections, "bio");
  const expSection = withCustomVisibility(
    getPortfolioSection(layoutSections, "experience"),
    isCustomMode ? customVisibility?.experience : undefined,
  );
  const eduSection = withCustomVisibility(
    getPortfolioSection(layoutSections, "education"),
    isCustomMode ? customVisibility?.education : undefined,
  );
  const certSection = withCustomVisibility(
    getPortfolioSection(layoutSections, "certification"),
    isCustomMode ? customVisibility?.certifications : undefined,
  );
  const skillsSection = withCustomVisibility(
    getPortfolioSection(layoutSections, "skills"),
    isCustomMode ? customVisibility?.skills : undefined,
  );
  const projSection = withCustomVisibility(
    getPortfolioSection(layoutSections, "projects"),
    isCustomMode ? customVisibility?.projects : undefined,
  );
  const testSection = withCustomVisibility(
    getPortfolioSection(layoutSections, "testimonials"),
    isCustomMode ? customVisibility?.testimonials : undefined,
  );
  const socialSection = withCustomVisibility(
    getPortfolioSection(layoutSections, "hero"),
    isCustomMode ? customVisibility?.social : undefined,
  );

  // Build all sections
  const bioHtml = buildBioSection(
    buildProfile,
    sections,
    mode.showBio,
    bioHeader.title,
    bioHeader.subheadline,
    bioSection,
  );
  const expHtml = buildExperienceSection(
    buildProfile,
    sections,
    mode.maxExperience,
    expHeader.title,
    expHeader.subheadline,
    expSection,
  );
  const eduHtml = buildEducationSection(
    buildProfile,
    sections,
    mode.maxEducation,
    eduHeader.title,
    eduHeader.subheadline,
    eduSection,
  );
  const certHtml = buildCertificationsSection(
    buildProfile,
    sections,
    null,
    certHeader.title,
    certHeader.subheadline,
    certSection,
  );
  const skillsHtml = buildSkillsSection(
    buildProfile,
    sections,
    mode.maxSkillsPerCategory,
    skillsHeader.title,
    skillsHeader.subheadline,
    skillsSection,
  );
  const projectsHtml = buildProjectsSection(
    strategyProjects,
    sections,
    mode.id,
    projectsHeader.title,
    projectsHeader.subheadline,
    projSection,
  );
  const testimonialsHtml = buildTestimonialsSection(
    limitedTestimonials,
    sections,
    mode.maxTestimonials,
    testimonialsHeader.title,
    testimonialsHeader.subheadline,
    testSection,
  );
  const socialHtml = buildSocialSection(
    buildProfile,
    sections,
    "Links",
    undefined,
    socialSection,
  );

  // Build header contact info
  const emailHtml = profile.email
    ? buildContactLink("email", profile.email)
    : "";
  const phoneHtml = profile.phone
    ? buildContactLink("phone", profile.phone)
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(profile.name)} — CV</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Poppins:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>${baseStyle}</style>
</head>
<body>
<div class="cv-wrap">
  <div class="cv-header">
    <div class="cv-name">${escapeHtml(profile.name)}</div>
    <div class="cv-headline">${escapeHtml(profile.headline || "")}</div>
    <div class="cv-meta">
      ${emailHtml}
      ${phoneHtml}
      ${loc ? `<span>📍 ${escapeHtml(loc)}</span>` : ""}
      ${profile.timezone ? `<span>🕐 ${escapeHtml(profile.timezone)}</span>` : ""}
    </div>
    ${profile.availableForWork ? `<div class="avail-badge">✓ ${escapeHtml(profile.availabilityNote || "Open to opportunities")}</div>` : ""}
  </div>
  ${bioHtml}
  ${expHtml}
  ${eduHtml}
  ${certHtml}
  ${skillsHtml}
  ${projectsHtml}
  ${testimonialsHtml}
  ${socialHtml}
</div>
</body>
</html>`;
}
