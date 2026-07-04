// components/CVGenerator/cvHtmlBuilder/styles.ts
import { getThemeColors } from "./utils";

export function generateBaseStyles(tone: string): string {
  const { accent, accent2 } = getThemeColors(tone);

  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Poppins', sans-serif; 
      color: #1a1a1a; 
      background: #ffffff; 
      font-size: 13px; 
      line-height: 1.6;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    a { color: ${accent2}; text-decoration: none; }
    .cv-meta a { color: #555555; text-decoration: none; }
    .cv-meta a:hover { text-decoration: underline; }
    .cv-wrap { max-width: 860px; margin: 0 auto; padding: 48px 52px; }

    /* Header */
    .cv-header { border-bottom: 3px solid ${accent}; padding-bottom: 20px; margin-bottom: 28px; }
    .cv-name { 
      font-family: 'Montserrat', sans-serif; 
      font-size: ${tone === "creative" ? "34px" : "28px"}; 
      font-weight: 700; 
      color: ${accent}; 
      letter-spacing: -0.5px; 
      line-height: 1.1; 
    }
    .cv-headline { font-size: 15px; color: ${accent2}; font-weight: 600; margin-top: 4px; }
    .cv-meta { display: flex; flex-wrap: wrap; gap: 12px 24px; margin-top: 12px; font-size: 12px; color: #555555; }
    .cv-meta span { display: flex; align-items: center; gap: 4px; }
    .avail-badge { 
      display: inline-block; 
      color: #166534; 
      font-size: 11px; 
      font-weight: 600; 
      padding: 2px 10px; 
      border-radius: 20px; 
      margin-top: 8px; 
    }

    /* Sections */
    .cv-section { 
      margin-bottom: 26px; 
      page-break-inside: auto;
      break-inside: auto;
    }
    .cv-section-title { 
      font-family: 'Montserrat', sans-serif; 
      font-size: 13px; 
      font-weight: 700; 
      text-transform: uppercase; 
      letter-spacing: 1.5px; 
      color: ${accent}; 
      border-bottom: 2px solid ${tone === "minimal" ? "#dddddd" : accent}; 
      padding-bottom: 5px; 
      margin-bottom: 14px; 
    }
    .cv-section-subheadline {
      font-size: 12px;
      color: #777777;
      margin-top: -8px;
      margin-bottom: 14px;
      font-style: italic;
    }

    /* Bio */
    .cv-bio { font-size: 13px; line-height: 1.7; color: #333333; }
    .cv-bio p { margin-bottom: 8px; }
    .cv-bio ul { padding-left: 18px; margin: 8px 0; }
    .cv-bio li { margin-bottom: 4px; }

    /* Experience */
    .cv-exp-item { 
      margin-bottom: 18px; 
      page-break-inside: avoid;
    }
    .cv-exp-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start; 
      margin-bottom: 4px; 
    }
    .cv-exp-role { font-weight: 700; font-size: 14px; color: #1a1a1a; }
    .cv-exp-company { font-weight: 600; color: ${accent2}; font-size: 13px; }
    .cv-exp-location { font-size: 11px; color: #888888; }
    .cv-exp-dates { font-size: 11px; color: #888888; white-space: nowrap; }
    .cv-exp-desc { margin-top: 6px; font-size: 12.5px; color: #333333; }
    .cv-exp-desc p { margin-bottom: 4px; }
    .cv-exp-desc ul { padding-left: 16px; margin: 4px 0; }
    .cv-exp-desc li { margin-bottom: 3px; }
    .cv-current-badge { 
      display: inline-block; 
      background: ${accent}; 
      color: #ffffff; 
      font-size: 10px; 
      font-weight: 600; 
      padding: 1px 8px; 
      border-radius: 20px; 
      margin-left: 8px; 
      vertical-align: middle; 
    }

    /* Education */
    .cv-edu-item { 
      margin-bottom: 14px; 
      page-break-inside: avoid;
    }
    .cv-edu-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2px;
    }
    .cv-edu-degree { font-weight: 700; font-size: 13.5px; }
    .cv-edu-inst { color: ${accent2}; font-size: 13px; }
    .cv-edu-years { font-size: 11px; color: #888888; white-space: nowrap; }

    /* Certifications */
    .cv-cert-item { 
      margin-bottom: 14px; 
      page-break-inside: avoid;
    }
    .cv-cert-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2px;
    }
    .cv-cert-name { font-weight: 700; font-size: 13.5px; }
    .cv-cert-org { color: ${accent2}; font-size: 13px; }
    .cv-cert-dates { font-size: 11px; color: #888888; white-space: nowrap; }
    .cv-cert-url { font-size: 11px; color: ${accent2}; }
    .cv-cert-valid { font-size: 10px; color: #166534; font-weight: 600; }
    .cv-cert-expired { font-size: 10px; color: #dc2626; font-weight: 600; }

    /* Skills */
    .cv-skills-grid { 
      display: block; 
      column-count: 2;
      column-gap: 24px;
      break-inside: auto;
      page-break-inside: auto;
    }
    .cv-skill-cat { 
      break-inside: avoid-column;
      page-break-inside: avoid;
      margin-bottom: 16px;
      -webkit-column-break-inside: avoid;
    }
    .cv-skill-cat-name { 
      font-weight: 700; 
      font-size: 11px; 
      text-transform: uppercase; 
      letter-spacing: 1px; 
      color: #888888; 
      margin-bottom: 10px; 
    }
    .cv-skill-item { 
      margin-bottom: 10px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .cv-skill-name { 
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 12px; 
      color: #333333; 
      margin-bottom: 4px; 
    }
    .cv-skill-label {
      font-weight: 500;
      color: #333333;
    }
    .cv-skill-level {
      font-size: 10px;
      color: #888888;
      font-weight: 400;
    }
    .cv-skill-bar-bg { 
      background: #e5e7eb; 
      border-radius: 4px; 
      height: 6px;
      width: 100%;
      overflow: hidden;
    }
    .cv-skill-bar-fill { 
      height: 6px; 
      border-radius: 4px; 
      background: ${accent2};
      transition: width 0.3s ease;
    }

    /* Projects */
    .cv-project-item { 
      margin-bottom: 16px; 
      padding-bottom: 16px; 
      border-bottom: 1px solid #f0f0f0; 
      page-break-inside: avoid;
    }
    .cv-project-item:last-child { border-bottom: none; }
    .cv-project-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start; 
      gap: 12px; 
    }
    .cv-project-title { font-weight: 700; font-size: 13.5px; color: #1a1a1a; }
    .cv-project-links { display: flex; gap: 8px; flex-shrink: 0; }
    .cv-project-links a { 
      font-size: 11px; 
      color: ${accent2}; 
      border: 1px solid ${accent2}; 
      padding: 2px 8px; 
      border-radius: 20px; 
      white-space: nowrap;
    }
    .cv-project-tags { display: flex; flex-wrap: wrap; gap: 4px; margin: 6px 0; }
    .cv-tag { font-size: 10px; background: #f3f4f6; color: #555555; padding: 2px 8px; border-radius: 20px; }
    .cv-project-desc { font-size: 12.5px; color: #444444; line-height: 1.6; }
    .cv-project-desc p { margin-bottom: 4px; }

    /* Testimonials */
    .cv-testimonial-item { 
      margin-bottom: 16px; 
      padding: 14px 16px; 
      background: #f9fafb; 
      border-left: 3px solid ${accent2}; 
      border-radius: 0 6px 6px 0; 
      page-break-inside: avoid;
    }
    .cv-testimonial-quote { font-size: 12.5px; color: #333333; font-style: italic; margin-bottom: 8px; line-height: 1.6; }
    .cv-testimonial-author { font-size: 12px; font-weight: 600; color: #555555; }
    .cv-testimonial-role { font-size: 11px; color: #888888; }
    .cv-stars { color: #f59e0b; font-size: 11px; margin-bottom: 4px; }

    /* Social */
    .cv-social-grid { display: flex; flex-wrap: wrap; gap: 8px 20px; }
    .cv-social-item { font-size: 12px; color: ${accent2}; }

    /* Table styles for DOCX compatibility */
    table { border-collapse: collapse; width: 100%; }
    td { vertical-align: top; }

    /* Print styles */
    @media print {
      body { 
        font-size: 12px; 
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .cv-wrap { padding: 24px 32px; }
      .cv-name { font-size: 24px; }
      .no-print { display: none !important; }

      .cv-section {
        page-break-inside: auto;
        break-inside: auto;
      }

      .cv-skills-grid {
        page-break-before: auto;
        break-before: auto;
      }

      .cv-skill-cat {
        page-break-inside: avoid;
        break-inside: avoid-column;
      }

      .cv-skill-item {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      .cv-skill-bar-bg { 
        background: #e5e7eb !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .cv-skill-bar-fill { 
        background: ${accent2} !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .cv-skill-label {
        color: #333333 !important;
      }
      .cv-skill-level {
        color: #888888 !important;
      }
      @page { margin: 0.5cm; }
    }
  `;
}
