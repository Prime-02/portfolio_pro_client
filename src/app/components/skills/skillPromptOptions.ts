// lib/promptOptions/skillPromptOptions.ts
import { PromptOption } from "../ai/AIAsistant";

// Function to generate prompt options for skill description
// Parameters match the actual fields available in EditSkillDialog
export const getSkillDescriptionOptions = (
  currentText: string,
  skillName: string,
  proficiencyLevel?: string,
  category?: string,
  subcategory?: string,
  difficultyLevel?: string,
  isMajor?: boolean,
): PromptOption[] => {
  // Return empty array if skill name is missing
  if (!skillName?.trim()) {
    return [];
  }

  const hasText = currentText.trim().length > 0;
  const skill = skillName.trim();
  const proficiency = proficiencyLevel || "Intermediate";
  const categoryName = category?.trim();
  const subcategoryName = subcategory?.trim();
  const difficulty = difficultyLevel?.trim();
  const isCoreSkill = isMajor ? "a core competency" : "a supporting skill";

  // Build context from available form fields
  const skillContext = [
    `${proficiency} level`,
    categoryName ? `in ${categoryName}` : "",
    subcategoryName ? `(${subcategoryName})` : "",
    difficulty ? `• ${difficulty} difficulty` : "",
    isCoreSkill,
  ]
    .filter(Boolean)
    .join(" ");

  const domainContext = [categoryName, subcategoryName]
    .filter(Boolean)
    .join(" - ");

  return [
    {
      title: "Improve description",
      prompt: hasText
        ? `Rewrite the following skill description for ${skill} (${skillContext}) to be more impactful and demonstrate practical expertise. Focus on real-world application and ${proficiency}-level proficiency. Current description: "${currentText}"`
        : `Write a compelling skill description for ${skill} (${skillContext}). Describe practical experience, ${proficiency}-level proficiency, and how this skill has been applied in professional settings. ${isMajor ? "Emphasize why this is a core competency." : ""} Keep it concise but detailed.`,
    },
    {
      title: "Technical depth",
      prompt: hasText
        ? `Add technical depth to this description, elaborating on specific tools, frameworks, or methodologies related to ${skill} at ${proficiency} level${domainContext ? ` in ${domainContext}` : ""}: "${currentText}"`
        : `Create a technically detailed description for ${skill} (${skillContext}), mentioning specific tools, versions, frameworks, or methodologies mastered at ${proficiency} level. Emphasize depth of technical knowledge.`,
    },
    {
      title: "Achievement-focused",
      prompt: hasText
        ? `Enhance this skill description by incorporating specific achievements and outcomes achieved using ${skill} (${skillContext}): "${currentText}"`
        : `Write an achievement-focused description for ${skill} as ${isCoreSkill} (${proficiency} level). Highlight specific results and outcomes achieved through this skill. Include measurable impacts like productivity gains or project successes.`,
    },
    {
      title: "Project application",
      prompt: hasText
        ? `Reframe this description to showcase real project applications of ${skill}${domainContext ? ` in ${domainContext}` : ""} at ${proficiency} level: "${currentText}"`
        : `Describe practical project applications of ${skill} (${skillContext}). Include specific scenarios, challenges solved, and outcomes delivered using this skill.`,
    },
    {
      title: "Core competency",
      prompt: hasText
        ? `Rewrite this description to emphasize why ${skill} is ${isCoreSkill}${domainContext ? ` in ${domainContext}` : ""}. ${isMajor ? "Highlight its strategic importance." : "Show how it complements other skills."} "${currentText}"`
        : `Write a description positioning ${skill} as ${isCoreSkill}${domainContext ? ` in ${domainContext}` : ""}. ${isMajor ? "Emphasize strategic importance and how it differentiates you professionally." : "Show how it supports and enhances your primary skill set."}`,
    },
    {
      title: "Learning journey",
      prompt: hasText
        ? `Transform this description to show the progression of ${skill} expertise${difficulty ? ` through ${difficulty.toLowerCase()} concepts` : ""}: "${currentText}"`
        : `Create a description showing the learning progression in ${skill} (${proficiency} level${difficulty ? `, ${difficulty.toLowerCase()} difficulty` : ""}). Highlight how expertise evolved and key milestones achieved.`,
    },
    {
      title: "Make concise",
      prompt: hasText
        ? `Condense this ${skill} description into a powerful 2-3 sentence statement (${skillContext}): "${currentText}"`
        : `Create a concise, impactful 2-sentence description for ${skill} (${skillContext}) that captures expertise level and key applications.`,
    },
    {
      title: "ATS optimization",
      prompt: hasText
        ? `Optimize this skill description with relevant keywords and industry-standard terms for ${skill} while keeping it natural. Context: ${skillContext}. Current text: "${currentText}"`
        : `Generate an ATS-optimized skill description for ${skill} (${skillContext}) using relevant keywords, variant terms, and industry-standard vocabulary${domainContext ? ` for the ${domainContext} domain` : ""}.`,
    },
  ];
};
