// components/CVGenerator/constants.ts
export const COMPLEXITY_MODES = [
  {
    id: "one-pager",
    label: "One-Pager",
    icon: "ti-file",
    description:
      "Concise single page — headline skills, top projects, key experience",
    projectStrategy: "featured",
    maxExperience: 2,
    maxEducation: 1,
    maxSkillsPerCategory: 4,
    maxTestimonials: 0,
    showBio: "short",
  },
  {
    id: "standard",
    label: "Standard",
    icon: "ti-files",
    description: "Well-rounded 2-page CV — balanced depth across all sections",
    projectStrategy: "page",
    maxExperience: 4,
    maxEducation: 2,
    maxSkillsPerCategory: 6,
    maxTestimonials: 2,
    showBio: "full",
  },
  {
    id: "detailed",
    label: "Detailed",
    icon: "ti-file-text",
    description: "Full document — every project, role, and achievement",
    projectStrategy: "all",
    maxExperience: null,
    maxEducation: null,
    maxSkillsPerCategory: null,
    maxTestimonials: 3,
    showBio: "full",
  },
  {
    id: "custom",
    label: "Custom",
    icon: "ti-adjustments",
    description: "You choose what goes in and how much detail to show",
    projectStrategy: "featured",
    maxExperience: null,
    maxEducation: null,
    maxSkillsPerCategory: null,
    maxTestimonials: 2,
    showBio: "full",
  },
] as const;

export const TONES = [
  {
    id: "professional",
    label: "Professional",
    description: "Formal, polished, corporate-ready",
  },
  {
    id: "creative",
    label: "Creative",
    description: "Expressive layout, bold headings",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Clean lines, maximum whitespace",
  },
] as const;

export const ALL_SECTIONS = [
  { id: "bio", label: "Summary", icon: "ti-user" },
  { id: "experience", label: "Experience", icon: "ti-briefcase" },
  { id: "education", label: "Education", icon: "ti-school" },
  { id: "skills", label: "Skills", icon: "ti-tools" },
  { id: "certifications", label: "Certifications", icon: "ti-certificate" },
  { id: "projects", label: "Projects", icon: "ti-layout-grid" },
  { id: "testimonials", label: "Testimonials", icon: "ti-message-circle" },
  { id: "social", label: "Social Links", icon: "ti-link" },
] as const;

// Field-level visibility toggles, shown only when complexity === "custom".
// Only lists flags that cvHtmlBuilder/sections.ts actually reads — a few
// keys exist on SectionVisibilityConfig (e.g. showCompanyLogo,
// showVerificationBadge) but aren't wired into a renderer yet, so they're
// intentionally left out here to avoid dead toggles.
export const VISIBILITY_FIELDS: Record<
  string,
  Array<{ key: string; label: string }>
> = {
  experience: [
    { key: "showJobTitle", label: "Job title" },
    { key: "showCompanyName", label: "Company name" },
    { key: "showLocation", label: "Location" },
    { key: "showDuration", label: "Dates" },
    { key: "showCurrentIndicator", label: '"Current" badge' },
    { key: "showDescription", label: "Description" },
  ],
  education: [
    { key: "showDegree", label: "Degree" },
    { key: "showFieldOfStudy", label: "Field of study" },
    { key: "showInstitution", label: "Institution" },
    { key: "showEducationDuration", label: "Dates" },
    { key: "showEducationDescription", label: "Description" },
  ],
  certifications: [
    { key: "showCertificationName", label: "Certification name" },
    { key: "showIssuingOrganization", label: "Issuing organization" },
    { key: "showIssueDate", label: "Issue date" },
    { key: "showExpirationDate", label: "Expiration date" },
    { key: "showValidityIndicator", label: "Valid/expired badge" },
    { key: "showCertificateLink", label: "Certificate link" },
  ],
  skills: [
    { key: "showSkillName", label: "Skill name" },
    { key: "showProficiency", label: "Proficiency label" },
    { key: "showProficiencyBar", label: "Proficiency bar" },
  ],
  projects: [
    { key: "showProjectTitle", label: "Project title" },
    { key: "showProjectLinks", label: "Live/repo links" },
    { key: "showProjectTags", label: "Tags" },
    { key: "showProjectDescription", label: "Description" },
  ],
  testimonials: [
    { key: "showRating", label: "Star rating" },
    { key: "showContent", label: "Quote" },
    { key: "showAuthorName", label: "Author name" },
    { key: "showAuthorTitle", label: "Author title" },
    { key: "showAuthorCompany", label: "Author company" },
  ],
  social: [
    { key: "showPlatform", label: "Platform name" },
    { key: "showUrl", label: "Clickable link" },
  ],
};

export const CV_SOURCES = [
  {
    id: "default" as const,
    label: "Default CV",
    icon: "ti-user",
    description: "Generate from your profile data across all sections",
  },
  {
    id: "portfolio" as const,
    label: "From Portfolio",
    icon: "ti-layout",
    description:
      "Generate using a portfolio layout with its filters and settings",
  },
] as const;
