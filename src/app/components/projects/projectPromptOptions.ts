// components/projects/projectPromptOptions.ts
import { PromptOption } from "../ai/AIAsistant";

interface ProjectFormData {
  project_name?: string;
  project_category?: string;
  project_summary?: string;
  project_description?: string;
  project_url?: string;
  start_date?: string | null;
  end_date?: string | null;
  client_name?: string;
  budget?: number | null;
  stack?: string[];
  tags?: string[];
}

// Function to generate prompt options for project summary
export const getProjectSummaryPromptOptions = (
  formData: ProjectFormData,
  currentText: string,
): PromptOption[] => {
  const { project_name, project_category } = formData;

  // Return empty array if required fields are missing
  if (!project_name?.trim() || !project_category?.trim()) {
    return [];
  }

  const hasText = currentText.trim().length > 0;
  const name = project_name.trim();
  const category = project_category.trim();
  const stack = formData.stack?.length ? formData.stack.join(", ") : "";
  const tags = formData.tags?.length ? formData.tags.join(", ") : "";
  const client = formData.client_name?.trim();
  const budget = formData.budget;
  const url = formData.project_url?.trim();
  const dateRange = formData.start_date
    ? formData.end_date
      ? `from ${formData.start_date} to ${formData.end_date}`
      : `started ${formData.start_date}`
    : "";

  // Build context-rich description
  const projectContext = [
    category ? `${category} project` : "",
    client ? `for client ${client}` : "",
    budget ? `with a budget of $${budget.toLocaleString()}` : "",
    dateRange ? `(${dateRange})` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const techContext = stack ? ` Built with: ${stack}.` : "";
  const tagContext = tags ? ` Key themes: ${tags}.` : "";
  const urlContext = url ? ` Project URL: ${url}` : "";

  return [
    {
      title: "Improve summary",
      prompt: hasText
        ? `Rewrite this project summary for "${name}" (${projectContext}) to be more engaging and impactful. Make it concise and highlight the project's value proposition.${techContext} Current summary: "${currentText}"`
        : `Write a compelling 2-3 sentence summary for the project "${name}" - a ${projectContext}.${techContext}${tagContext} Focus on the problem solved, target audience, and key outcome. Keep it under 500 characters.`,
    },
    {
      title: "Problem-solution",
      prompt: hasText
        ? `Restructure this summary to clearly highlight the problem addressed and the solution provided by "${name}" (${projectContext}): "${currentText}"`
        : `Write a problem-solution focused summary for "${name}" - a ${projectContext}. Start with the challenge, then present the solution.${techContext}`,
    },
    {
      title: "Technical highlight",
      prompt: hasText
        ? `Rewrite this summary to emphasize the technical achievements and architecture of "${name}"${stack ? ` using ${stack}` : ""}. ${projectContext}: "${currentText}"`
        : `Write a technically-focused summary for "${name}" (${projectContext}). Highlight the architecture, technologies used${stack ? ` (${stack})` : ""}, and technical challenges overcome.`,
    },
    {
      title: "Business impact",
      prompt: hasText
        ? `Reframe this summary to focus on business value, ROI, and measurable outcomes for "${name}"${client ? ` built for ${client}` : ""}${budget ? ` with a $${budget.toLocaleString()} budget` : ""}: "${currentText}"`
        : `Write a business-impact summary for "${name}" (${projectContext}). Focus on ROI, efficiency gains, or revenue impact.${budget ? ` The project had a $${budget.toLocaleString()} budget.` : ""}`,
    },
    {
      title: "Make shorter",
      prompt: hasText
        ? `Condense this summary for "${name}" into a single powerful sentence that captures the essence of the ${category} project: "${currentText}"`
        : `Create a one-sentence elevator pitch for "${name}" - a ${projectContext}. Make it memorable and impactful.`,
    },
    {
      title: "User-centric",
      prompt: hasText
        ? `Rewrite this summary from the end-user's perspective for "${name}". Focus on user experience, benefits, and pain points solved: "${currentText}"`
        : `Write a user-centric summary for "${name}" (${projectContext}). Focus on who the users are, what they gain, and how their experience is improved.${tagContext}`,
    },
    {
      title: "Portfolio-ready",
      prompt: hasText
        ? `Polish this summary to be portfolio-ready for "${name}". Make it professional, impressive, and suitable for potential employers or clients. ${projectContext}: "${currentText}"`
        : `Write a portfolio-ready summary for "${name}" (${projectContext}). It should impress potential employers/clients, showcase your skills${stack ? ` with ${stack}` : ""}, and demonstrate project impact.`,
    },
    {
      title: "Add metrics",
      prompt: hasText
        ? `Enhance this summary with relevant metrics and quantifiable results for "${name}" (${projectContext}). Add numbers like users, performance improvements, or time saved: "${currentText}"`
        : `Write a metrics-driven summary for "${name}" (${projectContext}). Include quantifiable results like user numbers, performance metrics, or efficiency gains.${techContext}`,
    },
  ];
};

// Function to generate prompt options for project description
export const getProjectDescriptionPromptOptions = (
  formData: ProjectFormData,
  currentText: string,
): PromptOption[] => {
  const { project_name, project_category } = formData;

  // Return empty array if required fields are missing
  if (!project_name?.trim() || !project_category?.trim()) {
    return [];
  }

  const hasText = currentText.trim().length > 0;
  const name = project_name.trim();
  const category = project_category.trim();
  const stack = formData.stack?.length ? formData.stack.join(", ") : "";
  const tags = formData.tags?.length ? formData.tags.join(", ") : "";
  const client = formData.client_name?.trim();
  const budget = formData.budget;
  const summary = formData.project_summary?.trim();
  const url = formData.project_url?.trim();
  const dateRange = formData.start_date
    ? formData.end_date
      ? `from ${formData.start_date} to ${formData.end_date}`
      : `started ${formData.start_date}`
    : "";

  // Build context-rich description
  const projectContext = [
    category ? `${category} project` : "",
    client ? `for client ${client}` : "",
    budget ? `with a budget of $${budget.toLocaleString()}` : "",
    dateRange ? `(${dateRange})` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const techContext = stack ? ` Built with: ${stack}.` : "";
  const tagContext = tags ? ` Key themes: ${tags}.` : "";
  const summaryContext = summary ? ` Project summary: "${summary}"` : "";

  return [
    {
      allowMarkdown: true,
      title: "Improve description",
      prompt: hasText
        ? `Rewrite this project description for "${name}" (${projectContext}) to be more detailed and well-structured.${techContext}${summaryContext} Use clear sections and professional language. Current description: "${currentText}"`
        : `Write a comprehensive project description for "${name}" - a ${projectContext}.${techContext}${tagContext}${summaryContext} Structure it with sections: Overview, Features, Technical Implementation, Challenges & Solutions, and Results. Use markdown formatting.`,
    },
    {
      allowMarkdown: true,
      title: "Feature breakdown",
      prompt: hasText
        ? `Enhance this description by adding a detailed feature breakdown section for "${name}". List and explain each key feature with its purpose and implementation details: "${currentText}"`
        : `Generate a detailed feature breakdown for "${name}" (${projectContext}).${techContext} Describe each major feature, its purpose, and how it was implemented. Use markdown headings and bullet points.`,
    },
    {
      allowMarkdown: true,
      title: "Technical deep dive",
      prompt: hasText
        ? `Add a technical deep dive section to this description for "${name}"${stack ? ` covering ${stack}` : ""}. Explain architecture decisions, technology choices, and implementation details: "${currentText}"`
        : `Write a technical deep dive for "${name}" (${projectContext}).${stack ? ` Cover the ${stack} stack,` : " Cover the"} architecture decisions, data flow, APIs, and any interesting technical challenges solved. Use code blocks where relevant.`,
    },
    {
      allowMarkdown: true,
      title: "Challenges & solutions",
      prompt: hasText
        ? `Add a "Challenges & Solutions" section to this description for "${name}". Detail 2-3 major obstacles overcome and how they were resolved: "${currentText}"`
        : `Create a "Challenges & Solutions" section for "${name}" (${projectContext}).${techContext} Describe 2-3 significant technical or design challenges, your approach to solving them, and the outcome. Show problem-solving skills.`,
    },
    {
      allowMarkdown: true,
      title: "Case study format",
      prompt: hasText
        ? `Restructure this description into a case study format for "${name}" (${projectContext}). Include: Problem, Approach, Solution, Results, and Lessons Learned: "${currentText}"`
        : `Write a case study for "${name}" (${projectContext}).${techContext}${summaryContext} Structure it as: Background, Problem Statement, Approach & Methodology, Solution Overview, Results & Impact, and Key Learnings. Use professional markdown formatting.`,
    },
    {
      allowMarkdown: true,
      title: "Results focused",
      prompt: hasText
        ? `Rewrite this description to emphasize results, metrics, and project outcomes for "${name}"${client ? ` for ${client}` : ""}. Add quantifiable impact where possible: "${currentText}"`
        : `Write a results-focused description for "${name}" (${projectContext}).${budget ? ` The project budget was $${budget.toLocaleString()}.` : ""} Include metrics like performance improvements, user adoption, time saved, or revenue impact.`,
    },
    {
      allowMarkdown: true,
      title: "Process & methodology",
      prompt: hasText
        ? `Add details about the development process and methodology used for "${name}". Include workflow, tools, collaboration approach, and project management: "${currentText}"`
        : `Describe the development process for "${name}" (${projectContext}). Cover the methodology (Agile/Scrum/etc.), workflow, tools used for collaboration, version control, CI/CD, and project management approach.${techContext}`,
    },
    {
      allowMarkdown: true,
      title: "Lessons learned",
      prompt: hasText
        ? `Add a "Lessons Learned" section to this description for "${name}". Reflect on key takeaways, what you'd do differently, and skills gained: "${currentText}"`
        : `Write a "Lessons Learned" section for "${name}" (${projectContext}). Reflect on technical skills gained, challenges that taught you something, what you'd improve, and how this project shaped your approach to future work.${techContext}`,
    },
    {
      allowMarkdown: true,
      title: "User story format",
      prompt: hasText
        ? `Restructure this description around user stories and personas for "${name}". Describe the target users, their needs, and how the project addresses them: "${currentText}"`
        : `Write a user-story-focused description for "${name}" (${projectContext}). Define target users/personas, their pain points, user journeys, and how the project solves their problems.${tagContext} Use a narrative style.`,
    },
    {
      allowMarkdown: true,
      title: "Setup & deployment",
      prompt: hasText
        ? `Add deployment, setup, and infrastructure details to this description for "${name}". Include hosting, CI/CD, and how to run the project: "${currentText}"`
        : `Write deployment and infrastructure documentation for "${name}" (${projectContext}).${stack ? ` Using ${stack},` : ""} describe the hosting platform, deployment process, environment setup, and any DevOps practices. Include setup instructions if open-source.`,
    },
  ];
};
