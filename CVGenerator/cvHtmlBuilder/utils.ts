// components/CVGenerator/cvHtmlBuilder/utils.ts
// ── HTML Escaping ────────────────────────────────────────────────────────────
export function escapeHtml(text: string | number | null | undefined): string {
  if (text == null) return "";
  const str = String(text);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Markdown-to-HTML (lightweight) ──────────────────────────────────────────
export function mdToHtml(md: string | null | undefined = ""): string {
  if (md == null || md === "") return "";
  return escapeHtml(md)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/^#{3}\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^#{2}\s+(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#{1}\s+(.+)$/gm, "<h1>$1</h1>")
    .replace(/^[-*]\s+(.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]+?<\/li>)/g, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hul])(.+)$/gm, (m) =>
      m.startsWith("<") ? m : `<p>${m}</p>`,
    )
    .replace(/<p><\/p>/g, "");
}

export function stripMd(
  md: string | null | undefined = "",
  maxChars = 300,
): string {
  if (md == null || md === "") return "";
  const plain = md
    .replace(/[#*`\[\]()]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  return plain.length > maxChars ? plain.slice(0, maxChars) + "…" : plain;
}

export function fmtDate(d: string | null | undefined): string {
  if (!d) return "Present";
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// ── Section header (title + optional subheadline) ──────────────────────────
export function buildSectionHeader(
  title: string,
  subheadline?: string,
): string {
  return `<div class="cv-section-title">${escapeHtml(title)}</div>${
    subheadline
      ? `<div class="cv-section-subheadline">${escapeHtml(subheadline)}</div>`
      : ""
  }`;
}

export const PROFICIENCY_MAP: Record<string, number> = {
  BEGINNER: 25,
  INTERMEDIATE: 50,
  ADVANCED: 75,
  EXPERT: 100,
  Beginner: 25,
  Intermediate: 50,
  Advanced: 75,
  Expert: 100,
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 100,
};

export function getThemeColors(tone: string): {
  accent: string;
  accent2: string;
} {
  switch (tone) {
    case "creative":
      return { accent: "#1a1a2e", accent2: "#e94560" };
    case "minimal":
      return { accent: "#111111", accent2: "#555555" };
    default: // professional
      return { accent: "#1e3a5f", accent2: "#2e6da4" };
  }
}

// ── Section Visibility Configuration ────────────────────────────────────────
export interface SectionVisibilityConfig {
  // Experience
  showJobTitle?: boolean;
  showCompanyName?: boolean;
  showCompanyLogo?: boolean;
  showDuration?: boolean;
  showLocation?: boolean;
  showLocationType?: boolean;
  showEmploymentType?: boolean;
  showDescription?: boolean;
  showCurrentIndicator?: boolean;
  // Education
  showDegree?: boolean;
  showFieldOfStudy?: boolean;
  showInstitution?: boolean;
  showInstitutionLogo?: boolean;
  showEducationDuration?: boolean;
  showEducationDescription?: boolean;
  // Certifications
  showCertificationName?: boolean;
  showIssuingOrganization?: boolean;
  showIssueDate?: boolean;
  showExpirationDate?: boolean;
  showCertificateLink?: boolean;
  showValidityIndicator?: boolean;
  showVerificationBadge?: boolean;
  // Skills
  showSkillName?: boolean;
  showProficiency?: boolean;
  showProficiencyBar?: boolean;
  // Projects
  showProjectTitle?: boolean;
  showProjectLinks?: boolean;
  showProjectTags?: boolean;
  showProjectDescription?: boolean;
  showProjectStatus?: boolean;
  showProjectCategory?: boolean;
  showProjectPlatform?: boolean;
  // Testimonials
  showRating?: boolean;
  showContent?: boolean;
  showAuthorName?: boolean;
  showAuthorTitle?: boolean;
  showAuthorCompany?: boolean;
  showAvatar?: boolean;
  // Social
  showUrl?: boolean;
  showPlatform?: boolean;
  // General
  showFeaturedBadge?: boolean;
  showImage?: boolean;
}

/**
 * Resolve visibility config from portfolio section data.
 * Returns an object where every flag defaults to true unless explicitly false.
 */
export function resolveVisibility(
  sectionData: { data?: Record<string, unknown> } | undefined,
): SectionVisibilityConfig {
  const cfg: SectionVisibilityConfig = {};
  if (!sectionData?.data) return cfg;

  const data = sectionData.data;
  const keys: Array<keyof SectionVisibilityConfig> = [
    "showJobTitle",
    "showCompanyName",
    "showCompanyLogo",
    "showDuration",
    "showLocation",
    "showLocationType",
    "showEmploymentType",
    "showDescription",
    "showCurrentIndicator",
    "showDegree",
    "showFieldOfStudy",
    "showInstitution",
    "showInstitutionLogo",
    "showEducationDuration",
    "showEducationDescription",
    "showCertificationName",
    "showIssuingOrganization",
    "showIssueDate",
    "showExpirationDate",
    "showCertificateLink",
    "showValidityIndicator",
    "showVerificationBadge",
    "showSkillName",
    "showProficiency",
    "showProficiencyBar",
    "showProjectTitle",
    "showProjectLinks",
    "showProjectTags",
    "showProjectDescription",
    "showProjectStatus",
    "showProjectCategory",
    "showProjectPlatform",
    "showRating",
    "showContent",
    "showAuthorName",
    "showAuthorTitle",
    "showAuthorCompany",
    "showAvatar",
    "showUrl",
    "showPlatform",
    "showFeaturedBadge",
    "showImage",
  ];

  for (const key of keys) {
    if (key in data) {
      cfg[key] = data[key] !== false;
    }
  }
  return cfg;
}
