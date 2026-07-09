import { PromptOption } from "../ai/AIAsistant";

interface ExperienceFormData {
  job_title: string;
  company_name: string;
  employment_type?: string;
  location_type?: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  industry?: string;
  company_size?: string;
  skills_used?: string;
  responsibilities?: string;
}

// Function to generate prompt options for experience description
export const getExperienceDescriptionPromptOptions = (
  formData: ExperienceFormData,
  currentText: string,
): PromptOption[] => {
  const { job_title, company_name, start_date } = formData;

  // Return empty array if required fields are missing
  if (!job_title?.trim() || !company_name?.trim() || !start_date?.trim()) {
    return [];
  }

  const hasText = currentText.trim().length > 0;
  const company = company_name.trim();
  const title = job_title.trim();
  const employmentType = formData.employment_type || "full-time";
  const locationType = formData.location_type || "on-site";
  const location = formData.location?.trim();
  const industry = formData.industry?.trim();
  const companySize = formData.company_size?.trim();
  const skillsUsed = formData.skills_used?.trim();
  const dateRange = formData.is_current
    ? `since ${start_date}`
    : `from ${start_date} to ${formData.end_date || "present"}`;

  // Build context-rich description
  const roleContext = [
    employmentType,
    locationType,
    location ? `in ${location}` : "",
    industry ? `in the ${industry} industry` : "",
    companySize ? `at a ${companySize.toLowerCase()} company` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const skillsContext = skillsUsed ? ` Key skills include: ${skillsUsed}.` : "";

  return [
    {
      title: "Improve description",
      prompt: hasText
        ? `Rewrite the following job description for a ${title} at ${company} to be more impactful and achievement-focused. This role is ${roleContext}.${skillsContext} Use strong action verbs and quantify results where possible. Current description: "${currentText}"`
        : `Write a compelling and detailed job description for a ${title} position at ${company}. This role is ${roleContext}.${skillsContext} Focus on key responsibilities, impact, and use strong action verbs. Structure it as 2-3 concise but powerful sentences.`,
    },
    {
      title: "Industry-specific",
      prompt: hasText
        ? `Rewrite this description with ${industry ? `${industry}-specific` : "industry-specific"} terminology and best practices for a ${title} at ${company} (${roleContext}): "${currentText}"`
        : `Write an industry-focused description for a ${title} at ${company} (${roleContext}). Use relevant terminology and highlight domain expertise.`,
    },
    {
      title: "Skills highlight",
      prompt: hasText
        ? `Enhance this description by naturally incorporating these skills: ${skillsUsed || "relevant technical and soft skills"} for a ${title} at ${company}. Show how each skill was applied to create impact: "${currentText}"`
        : `Write a skills-focused description for a ${title} at ${company} (${roleContext}), demonstrating how specific competencies drive results.`,
    },
    {
      title: "Make concise",
      prompt: hasText
        ? `Condense the following job description for ${title} at ${company} into 2-3 powerful sentences that highlight only the most impactful aspects. Context: ${roleContext}${skillsContext}. Current text: "${currentText}"`
        : `Create a concise 2-sentence summary for a ${title} at ${company} (${roleContext}), highlighting the role's primary impact and scope.`,
    },
    {
      title: "Add metrics",
      prompt: hasText
        ? `Enhance the following description by adding relevant metrics and quantifiable achievements where possible (e.g., percentages, dollar amounts, team sizes, timeframes). Consider the context: ${roleContext}${skillsContext}. Keep the original structure but make it data-driven: "${currentText}"`
        : `Write a metrics-driven description for a ${title} at ${company} (${roleContext}). Include quantifiable scope like team size, budget managed, or project scale${skillsUsed ? ` related to ${skillsUsed}` : ""}.`,
    },
    {
      title: "Leadership focus",
      prompt: hasText
        ? `Rewrite the following to emphasize leadership, strategic impact, and cross-functional collaboration for a ${title} at ${company}. Consider this is ${companySize ? `a ${companySize.toLowerCase()} company` : "a company"} ${industry ? `in the ${industry} industry` : ""}: "${currentText}"`
        : `Write a leadership-focused description for a ${title} at ${company} (${roleContext}), emphasizing strategic vision, team development, and organizational impact.`,
    },
    {
      title: "Technical focus",
      prompt: hasText
        ? `Reframe the following description to highlight technical skills, tools, and methodologies used in a ${title} role at ${company}${industry ? ` in the ${industry} industry` : ""}. ${skillsUsed ? `Incorporate these skills naturally: ${skillsUsed}.` : ""} Current text: "${currentText}"`
        : `Write a technically-focused description for a ${title} at ${company} (${roleContext}), highlighting specific tools, technologies, and methodologies used.`,
    },
    {
      title: "Career progression",
      prompt: hasText
        ? `Transform the following to tell a career progression story for ${title} at ${company} (${roleContext}), showing growth and increasing responsibility. ${skillsUsed ? `Show how skills like ${skillsUsed} evolved.` : ""} Current text: "${currentText}"`
        : `Create a description that shows career growth and progression for a ${title} at ${company} ${dateRange}, highlighting promotions, expanded scope, or increasing responsibilities.`,
    },
    {
      title: "ATS optimization",
      prompt: hasText
        ? `Optimize the following description with relevant industry keywords and ATS-friendly terms for a ${title} role${industry ? ` in ${industry}` : ""} while keeping it natural and readable. Context: ${roleContext}${skillsContext}. Current text: "${currentText}"`
        : `Generate an ATS-optimized description for a ${title} at ${company} (${roleContext}) using relevant keywords${skillsUsed ? ` including ${skillsUsed}` : ""}.`,
    },
  ];
};

// Function to generate prompt options for experience achievements
export const getExperienceAchievementsPromptOptions = (
  formData: ExperienceFormData,
  currentText: string,
): PromptOption[] => {
  const { job_title, company_name, start_date } = formData;

  // Return empty array if required fields are missing
  if (!job_title?.trim() || !company_name?.trim() || !start_date?.trim()) {
    return [];
  }

  const hasText = currentText.trim().length > 0;
  const company = company_name.trim();
  const title = job_title.trim();
  const employmentType = formData.employment_type || "full-time";
  const locationType = formData.location_type || "on-site";
  const location = formData.location?.trim();
  const industry = formData.industry?.trim();
  const companySize = formData.company_size?.trim();
  const skillsUsed = formData.skills_used?.trim();
  const description = formData.description?.trim();
  const dateRange = formData.is_current
    ? `since ${start_date}`
    : `from ${start_date} to ${formData.end_date || "present"}`;

  // Build context-rich description
  const roleContext = [
    employmentType,
    locationType,
    location ? `in ${location}` : "",
    industry ? `in the ${industry} industry` : "",
    companySize ? `at a ${companySize.toLowerCase()} company` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const skillsContext = skillsUsed ? ` Key skills used: ${skillsUsed}.` : "";

  const descriptionContext = description
    ? ` Role overview: ${description}`
    : "";

  return [
    {
      title: "Generate achievements",
      prompt: hasText
        ? `Based on this context for a ${title} at ${company}: "${currentText}". ${descriptionContext}${skillsContext} Generate 5-6 specific, quantifiable achievements that are realistic for this ${roleContext} role. Use the format: "[Action verb] [what you did] [result/impact with metrics]".`
        : `Generate 5-6 impressive, quantifiable achievements for a ${title} at ${company} (${roleContext}).${descriptionContext}${skillsContext} Each achievement should follow: [Strong action verb] + [what was done] + [quantifiable result]. Include metrics like percentages, dollar amounts, or time saved relevant to ${industry || "this role"}.`,
    },
    {
      title: "Revenue impact",
      prompt: hasText
        ? `Transform these achievements to emphasize revenue growth, cost savings, and financial impact for ${title} at ${company} (${roleContext}): "${currentText}"`
        : `Create 3-4 achievements focused on revenue growth, cost reduction, and financial impact for a ${title} at ${company}${industry ? ` in ${industry}` : ""}. Include specific dollar amounts or percentage improvements relevant to ${companySize ? `a ${companySize.toLowerCase()} company` : "this organization"}.`,
    },
    {
      title: "Team & leadership",
      prompt: hasText
        ? `Reformat these achievements to highlight team leadership, mentoring, and organizational impact for ${title} at ${company} (${roleContext}): "${currentText}"`
        : `Generate 3-4 achievements highlighting team leadership, mentoring, hiring, and organizational development for a ${title} at ${company}. Include metrics like team size, retention rates, or promotion rates${companySize ? ` appropriate for a ${companySize.toLowerCase()} company` : ""}.`,
    },
    {
      title: "Process improvement",
      prompt: hasText
        ? `Reframe these achievements to focus on process optimization, efficiency gains, and operational improvements for ${title} at ${company} (${roleContext}): "${currentText}"`
        : `Create 3-4 achievements focused on process improvements, automation, and efficiency gains for a ${title} at ${company}${skillsUsed ? ` using skills like ${skillsUsed}` : ""}. Include metrics like time saved, cost reduced, or productivity increased.`,
    },
    {
      title: "Customer impact",
      prompt: hasText
        ? `Rewrite these achievements to emphasize customer satisfaction, user growth, and client success for ${title} at ${company} (${roleContext}): "${currentText}"`
        : `Generate 3-4 achievements focused on customer satisfaction, NPS scores, user growth, or client retention for a ${title} at ${company}${industry ? ` in the ${industry} industry` : ""}. Include specific metrics and feedback outcomes.`,
    },
    {
      title: "Innovation focus",
      prompt: hasText
        ? `Transform these achievements to highlight innovation, new initiatives, and transformative projects for ${title} at ${company} (${roleContext}): "${currentText}"`
        : `Create 3-4 achievements showcasing innovation, new product launches, or digital transformation for a ${title} at ${company}${industry ? ` in ${industry}` : ""}. Include metrics like adoption rates, time to market, or competitive advantage gained.`,
    },
    {
      title: "Skill-driven results",
      prompt: hasText
        ? `Rewrite these achievements to showcase how specific skills${skillsUsed ? ` (${skillsUsed})` : ""} led to measurable outcomes for ${title} at ${company}: "${currentText}"`
        : `Generate 3-4 achievements that demonstrate how applying ${skillsUsed || "key competencies"} as a ${title} at ${company} drove specific, measurable results. Each achievement should link a skill to a quantifiable outcome.`,
    },
    {
      title: "Company scale impact",
      prompt: hasText
        ? `Adjust these achievements to reflect the scale and scope appropriate for ${companySize ? `a ${companySize.toLowerCase()} company` : "this organization"} in ${industry || "its industry"} for ${title} at ${company}: "${currentText}"`
        : `Create 3-4 achievements scaled appropriately for ${companySize ? `a ${companySize.toLowerCase()} company` : "this organization"}${industry ? ` in ${industry}` : ""} for a ${title} role. Include metrics that make sense for this context.`,
    },
    {
      title: "STAR format",
      prompt: hasText
        ? `Convert these achievements into STAR format (Situation, Task, Action, Result) for ${title} at ${company}. Context: ${roleContext}${descriptionContext}: "${currentText}"`
        : `Generate 3-4 achievements in STAR format for a ${title} at ${company} (${roleContext}).${descriptionContext} Each should include: Situation (context), Task (challenge), Action (what you did), Result (quantifiable outcome).`,
    },
  ];
};
