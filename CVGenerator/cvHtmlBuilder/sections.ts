// components/CVGenerator/cvHtmlBuilder/sections.ts
import {
  mdToHtml,
  stripMd,
  fmtDate,
  PROFICIENCY_MAP,
  buildSectionHeader,
  escapeHtml,
  resolveVisibility,
} from "./utils";
import type { SectionVisibilityConfig } from "./utils";
import type {
  CVProfile,
  CVExperience,
  CVEducation,
  CVSkill,
  CVCertification,
  CVProject,
  CVTestimonial,
  PortfolioSectionData,
} from "./types";

/* ── helpers ─────────────────────────────────────────────────────────────── */

function getVisibility(
  sectionData: PortfolioSectionData | undefined,
): SectionVisibilityConfig {
  return resolveVisibility(sectionData);
}

function maybeShow(
  cfg: SectionVisibilityConfig,
  key: keyof SectionVisibilityConfig,
): boolean {
  return cfg[key] !== false;
}

/* ── Bio ──────────────────────────────────────────────────────────────────── */

export function buildBioSection(
  profile: CVProfile,
  sections: string[],
  showBio: string,
  title: string = "Summary",
  subheadline?: string,
  sectionData?: PortfolioSectionData,
): string {
  if (!sections.includes("bio") || !profile.bio) return "";

  const bioContent =
    showBio === "short"
      ? `<p>${stripMd(profile.bio, 400)}</p>`
      : `<div>${mdToHtml(profile.bio)}</div>`;

  return `<div class="cv-section">${buildSectionHeader(title, subheadline)}<div class="cv-bio">${bioContent}</div></div>`;
}

/* ── Experience ───────────────────────────────────────────────────────────── */

export function buildExperienceSection(
  profile: CVProfile,
  sections: string[],
  maxExperience: number | null,
  title: string = "Experience",
  subheadline?: string,
  sectionData?: PortfolioSectionData,
): string {
  if (!sections.includes("experience") || !profile.experiences?.length)
    return "";

  const vis = getVisibility(sectionData);

  const exps = maxExperience
    ? profile.experiences.slice(0, maxExperience)
    : profile.experiences;

  const items = exps
    .map((e: CVExperience) => {
      const roleHtml = maybeShow(vis, "showJobTitle")
        ? `${escapeHtml(e.role)}${e.current && maybeShow(vis, "showCurrentIndicator") ? '<span class="cv-current-badge">Current</span>' : ""}`
        : "";

      const companyHtml = maybeShow(vis, "showCompanyName")
        ? `<div class="cv-exp-company">${escapeHtml(e.company)}</div>`
        : "";

      const locationHtml =
        e.location && maybeShow(vis, "showLocation")
          ? `<div class="cv-exp-location">${escapeHtml(e.location)}</div>`
          : "";

      const datesHtml = maybeShow(vis, "showDuration")
        ? `<div class="cv-exp-dates">${fmtDate(e.startDate)} — ${e.current ? "Present" : fmtDate(e.endDate)}</div>`
        : "";

      const descHtml =
        e.description && maybeShow(vis, "showDescription")
          ? `<div class="cv-exp-desc">${mdToHtml(e.description)}</div>`
          : "";

      return `
    <div class="cv-exp-item">
      <div class="cv-exp-header">
        <div>
          ${roleHtml ? `<div class="cv-exp-role">${roleHtml}</div>` : ""}
          ${companyHtml}
          ${locationHtml}
        </div>
        ${datesHtml}
      </div>
      ${descHtml}
    </div>
  `;
    })
    .join("");

  return `<div class="cv-section">${buildSectionHeader(title, subheadline)}${items}</div>`;
}

/* ── Education ────────────────────────────────────────────────────────────── */

export function buildEducationSection(
  profile: CVProfile,
  sections: string[],
  maxEducation: number | null,
  title: string = "Education",
  subheadline?: string,
  sectionData?: PortfolioSectionData,
): string {
  if (!sections.includes("education") || !profile.educations?.length) return "";

  const vis = getVisibility(sectionData);

  const edus = maxEducation
    ? profile.educations.slice(0, maxEducation)
    : profile.educations;

  const items = edus
    .map((ed: CVEducation) => {
      const degreeParts: string[] = [];
      if (maybeShow(vis, "showDegree")) degreeParts.push(ed.degree);
      if (ed.field && maybeShow(vis, "showFieldOfStudy"))
        degreeParts.push(ed.field);

      const degreeHtml = degreeParts.length
        ? `<div class="cv-edu-degree">${escapeHtml(degreeParts.join(" — "))}</div>`
        : "";

      const instHtml = maybeShow(vis, "showInstitution")
        ? `<div class="cv-edu-inst">${escapeHtml(ed.institution)}</div>`
        : "";

      const yearsHtml = maybeShow(vis, "showEducationDuration")
        ? `<div class="cv-edu-years">${escapeHtml(String(ed.startYear ?? ""))} — ${ed.current ? "Present" : escapeHtml(String(ed.endYear ?? ""))}</div>`
        : "";

      const descHtml =
        ed.description && maybeShow(vis, "showEducationDescription")
          ? `<div class="cv-edu-desc" style="margin-top:6px;font-size:12.5px;color:#333;">${mdToHtml(ed.description)}</div>`
          : "";

      return `
    <div class="cv-edu-item">
      <div class="cv-edu-header">
        <div>
          ${degreeHtml}
          ${instHtml}
        </div>
        ${yearsHtml}
      </div>
      ${descHtml}
    </div>
  `;
    })
    .join("");

  return `<div class="cv-section">${buildSectionHeader(title, subheadline)}${items}</div>`;
}

/* ── Certifications ───────────────────────────────────────────────────────── */

export function buildCertificationsSection(
  profile: CVProfile,
  sections: string[],
  maxCertifications: number | null,
  title: string = "Certifications",
  subheadline?: string,
  sectionData?: PortfolioSectionData,
): string {
  if (!sections.includes("certifications") || !profile.certifications?.length)
    return "";

  const vis = getVisibility(sectionData);

  const certs = maxCertifications
    ? profile.certifications.slice(0, maxCertifications)
    : profile.certifications;

  const items = certs
    .map((cert: CVCertification) => {
      const issueDate =
        cert.issue_date && maybeShow(vis, "showIssueDate")
          ? fmtDate(cert.issue_date)
          : "";
      const expDate =
        cert.expiration_date && maybeShow(vis, "showExpirationDate")
          ? fmtDate(cert.expiration_date)
          : "";
      const dateRange =
        issueDate && expDate ? `${issueDate} — ${expDate}` : issueDate || "";

      const isExpired = cert.expiration_date
        ? new Date(cert.expiration_date) < new Date()
        : false;
      const validityBadge =
        cert.expiration_date && maybeShow(vis, "showValidityIndicator")
          ? isExpired
            ? '<span class="cv-cert-expired">Expired</span>'
            : '<span class="cv-cert-valid">Valid</span>'
          : "";

      const nameHtml = maybeShow(vis, "showCertificationName")
        ? `<div class="cv-cert-name">${escapeHtml(cert.certification_name)}</div>`
        : "";

      const orgHtml =
        cert.issuing_organization && maybeShow(vis, "showIssuingOrganization")
          ? `<div class="cv-cert-org">${escapeHtml(cert.issuing_organization)}</div>`
          : "";

      const urlHtml =
        cert.certificate_external_url && maybeShow(vis, "showCertificateLink")
          ? `<div class="cv-cert-url"><a href="${escapeHtml(cert.certificate_external_url)}" target="_blank">View Certificate ↗</a></div>`
          : "";

      return `
    <div class="cv-cert-item">
      <div class="cv-cert-header">
        <div>
          ${nameHtml}
          ${orgHtml}
        </div>
        <div class="cv-cert-dates">${dateRange} ${validityBadge}</div>
      </div>
      ${urlHtml}
    </div>
  `;
    })
    .join("");

  return `<div class="cv-section">${buildSectionHeader(title, subheadline)}${items}</div>`;
}

/* ── Skills ───────────────────────────────────────────────────────────────── */

export function buildSkillsSection(
  profile: CVProfile,
  sections: string[],
  maxSkillsPerCategory: number | null,
  title: string = "Skills",
  subheadline?: string,
  sectionData?: PortfolioSectionData,
): string {
  if (!sections.includes("skills") || !profile.skills?.length) return "";

  const vis = getVisibility(sectionData);

  const byCategory = profile.skills.reduce<Record<string, CVSkill[]>>(
    (acc, sk) => {
      if (!acc[sk.category]) acc[sk.category] = [];
      acc[sk.category].push(sk);
      return acc;
    },
    {},
  );

  const categories = Object.entries(byCategory)
    .map(([cat, skills]) => {
      const shown = maxSkillsPerCategory
        ? skills.slice(0, maxSkillsPerCategory)
        : skills;

      const skillItems = shown
        .map((sk: CVSkill) => {
          const nameHtml = maybeShow(vis, "showSkillName")
            ? `<span class="cv-skill-label">${escapeHtml(sk.name)}</span>`
            : "";

          const levelHtml = maybeShow(vis, "showProficiency")
            ? `<span class="cv-skill-level">${escapeHtml(sk.proficiency)}</span>`
            : "";

          const barHtml = maybeShow(vis, "showProficiencyBar")
            ? `<div class="cv-skill-bar-bg"><div class="cv-skill-bar-fill" style="width: ${PROFICIENCY_MAP[sk.proficiency] || 50}%;"></div></div>`
            : "";

          return `
        <div class="cv-skill-item">
          <div class="cv-skill-name">
            ${nameHtml}
            ${levelHtml}
          </div>
          ${barHtml}
        </div>
      `;
        })
        .join("");

      return `<div class="cv-skill-cat"><div class="cv-skill-cat-name">${escapeHtml(cat)}</div>${skillItems}</div>`;
    })
    .join("");

  return `<div class="cv-section">${buildSectionHeader(title, subheadline)}<div class="cv-skills-grid">${categories}</div></div>`;
}

/* ── Projects ───────────────────────────────────────────────────────────────── */

export function buildProjectsSection(
  projects: CVProject[],
  sections: string[],
  modeId: string,
  title: string = "Projects",
  subheadline?: string,
  sectionData?: PortfolioSectionData,
): string {
  if (!sections.includes("projects") || !projects?.length) return "";

  const vis = getVisibility(sectionData);

  const items = projects
    .map((p: CVProject) => {
      const titleHtml = maybeShow(vis, "showProjectTitle")
        ? `<div class="cv-project-title">${escapeHtml(p.title)}</div>`
        : "";

      const linksHtml = maybeShow(vis, "showProjectLinks")
        ? `<div class="cv-project-links">
          ${p.liveUrl ? `<a href="${escapeHtml(p.liveUrl)}" target="_blank">Live ↗</a>` : ""}
          ${p.repoUrl ? `<a href="${escapeHtml(p.repoUrl)}" target="_blank">Repo ↗</a>` : ""}
        </div>`
        : "";

      const tagsHtml =
        p.tags?.length && maybeShow(vis, "showProjectTags")
          ? `<div class="cv-project-tags">${p.tags.map((t: string) => `<span class="cv-tag">${escapeHtml(t)}</span>`).join("")}</div>`
          : "";

      const descHtml = maybeShow(vis, "showProjectDescription")
        ? `<div class="cv-project-desc">${modeId === "one-pager" ? `<p>${stripMd(p.description || p.summary, 200)}</p>` : mdToHtml(p.description || p.summary)}</div>`
        : "";

      return `
    <div class="cv-project-item">
      <div class="cv-project-header">
        ${titleHtml}
        ${linksHtml}
      </div>
      ${tagsHtml}
      ${descHtml}
    </div>
  `;
    })
    .join("");

  return `<div class="cv-section">${buildSectionHeader(title, subheadline)}${items}</div>`;
}

/* ── Testimonials ─────────────────────────────────────────────────────────── */

export function buildTestimonialsSection(
  testimonials: CVTestimonial[],
  sections: string[],
  maxTestimonials: number,
  title: string = "Testimonials",
  subheadline?: string,
  sectionData?: PortfolioSectionData,
): string {
  if (
    !sections.includes("testimonials") ||
    !testimonials?.length ||
    maxTestimonials <= 0
  )
    return "";

  const vis = getVisibility(sectionData);

  const shown = testimonials.slice(0, maxTestimonials);

  const items = shown
    .map((t: CVTestimonial) => {
      const starsHtml = maybeShow(vis, "showRating")
        ? `<div class="cv-stars">${"★".repeat(t.rating || 5)}${"☆".repeat(5 - (t.rating || 5))}</div>`
        : "";

      const contentHtml = maybeShow(vis, "showContent")
        ? `<div class="cv-testimonial-quote">"${escapeHtml(t.content)}"</div>`
        : "";

      const authorHtml = maybeShow(vis, "showAuthorName")
        ? `<div class="cv-testimonial-author">${escapeHtml(t.name)}</div>`
        : "";

      const roleHtml =
        maybeShow(vis, "showAuthorTitle") || maybeShow(vis, "showAuthorCompany")
          ? `<div class="cv-testimonial-role">${[
              maybeShow(vis, "showAuthorTitle") ? t.role : null,
              maybeShow(vis, "showAuthorCompany") ? t.company : null,
            ]
              .filter(Boolean)
              .join(", ")}</div>`
          : "";

      return `
    <div class="cv-testimonial-item">
      ${starsHtml}
      ${contentHtml}
      ${authorHtml}
      ${roleHtml}
    </div>
  `;
    })
    .join("");

  return `<div class="cv-section">${buildSectionHeader(title, subheadline)}${items}</div>`;
}

/* ── Social ───────────────────────────────────────────────────────────────── */

export function buildSocialSection(
  profile: CVProfile,
  sections: string[],
  title: string = "Links",
  subheadline?: string,
  sectionData?: PortfolioSectionData,
): string {
  if (!sections.includes("social") || !profile.socialLinks?.length) return "";

  const vis = getVisibility(sectionData);

  const links = profile.socialLinks
    .map((sl) => {
      const platformHtml = maybeShow(vis, "showPlatform")
        ? `${escapeHtml(sl.platform)} ↗`
        : "Link ↗";
      const urlHtml = maybeShow(vis, "showUrl")
        ? `<a class="cv-social-item" href="${escapeHtml(sl.url)}" target="_blank">${platformHtml}</a>`
        : `<span class="cv-social-item">${platformHtml}</span>`;
      return urlHtml;
    })
    .join("");

  return `<div class="cv-section">${buildSectionHeader(title, subheadline)}<div class="cv-social-grid">${links}</div></div>`;
}
