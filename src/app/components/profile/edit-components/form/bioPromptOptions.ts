import { PromptOption } from "../../../ai/AIAsistant";

interface BioContext {
  currentText?: string;
  profession?: string;
  jobTitle?: string;
  yearsOfExperience?: string;
  availability?: string;
  openToWork?: boolean;
}

// Function to generate prompt options with context of existing bio
export const getBioPromptOptions = (
  context: BioContext = {},
): PromptOption[] => {
  const {
    currentText = "",
    profession,
    jobTitle,
    yearsOfExperience,
    availability,
    openToWork,
  } = context;

  const hasText = currentText.trim().length > 0;
  const hasContext = profession || jobTitle || yearsOfExperience;

  // Build context string for prompts
  const buildContextString = () => {
    const parts: string[] = [];
    if (profession) parts.push(`profession: ${profession}`);
    if (jobTitle) parts.push(`job title: ${jobTitle}`);
    if (yearsOfExperience)
      parts.push(`years of experience: ${yearsOfExperience}`);
    if (availability) parts.push(`availability: ${availability}`);
    if (openToWork !== undefined)
      parts.push(`open to work: ${openToWork ? "yes" : "no"}`);
    return parts.join(", ");
  };

  const contextString = buildContextString();
  const contextPrompt = hasContext ? ` Context: ${contextString}.` : "";

  return [
    {
      allowMarkdown: true,
      title: "Professional bio",
      prompt: hasText
        ? `Rewrite the following bio to be more professional and impactful while maintaining the key information.${contextPrompt} Original bio: "${currentText}"`
        : `Generate a professional and compelling bio${hasContext ? ` for someone with ${contextString}` : ""}. Keep it concise, highlight key strengths, and make it suitable for LinkedIn or a professional website.`,
    },
    {
      allowMarkdown: true,
      title: "Make concise",
      prompt: hasText
        ? `Condense the following bio into a shorter, punchier version (2-3 sentences max) while keeping the most important information.${contextPrompt} Original bio: "${currentText}"`
        : `Write a short, punchy professional bio (2-3 sentences)${hasContext ? ` for someone with ${contextString}` : ""}.`,
    },
    {
      allowMarkdown: true,
      title: "Make detailed",
      prompt: hasText
        ? `Expand the following bio with more detail, accomplishments, and personality while staying professional.${contextPrompt} Original bio: "${currentText}"`
        : `Generate a detailed professional bio${hasContext ? ` for someone with ${contextString}` : ""}. Include background, key skills, and what makes them unique. Keep it under 2000 characters.`,
    },
    {
      allowMarkdown: true,
      title: "Add achievements",
      prompt: hasText
        ? `Enhance the following bio by adding relevant professional achievements, metrics, or impact statements. Keep it authentic and data-driven where possible.${contextPrompt} Original bio: "${currentText}"`
        : `Generate a bio that highlights key professional achievements and impact${hasContext ? ` for someone with ${contextString}` : ""}. Use metrics and results where possible.`,
    },
    {
      allowMarkdown: true,
      title: "Casual tone",
      prompt: hasText
        ? `Rewrite the following bio in a casual, approachable tone while keeping it professional. Make it sound conversational and authentic.${contextPrompt} Original bio: "${currentText}"`
        : `Generate a casual yet professional bio${hasContext ? ` for someone with ${contextString}` : ""}. Make it sound authentic, approachable, and conversational.`,
    },
    {
      allowMarkdown: true,
      title: "Open to work",
      prompt: hasText
        ? `Update the following bio to indicate that this person is open to work opportunities. Add a natural call-to-action for recruiters or collaborators.${contextPrompt} Original bio: "${currentText}"`
        : `Generate a professional bio${hasContext ? ` for someone with ${contextString}` : ""} that clearly indicates they are open to work opportunities. Include a subtle call-to-action for recruiters or potential collaborators.`,
    },
    {
      allowMarkdown: true,
      title: "LinkedIn headline",
      prompt: hasText
        ? `Transform the following bio into a compelling LinkedIn headline (under 220 characters) that captures attention and includes key keywords.${contextPrompt} Original bio: "${currentText}"`
        : `Create a compelling LinkedIn headline (under 220 characters)${hasContext ? ` for someone with ${contextString}` : ""}. Make it keyword-rich and attention-grabbing.`,
    },
    {
      allowMarkdown: true,
      title: "First person",
      prompt: hasText
        ? `Rewrite the following bio in first person ("I" statements) to make it more personal and engaging.${contextPrompt} Original bio: "${currentText}"`
        : `Generate a first-person professional bio${hasContext ? ` for someone with ${contextString}` : ""}. Use "I" statements and make it personal while staying professional.`,
    },
    {
      allowMarkdown: true,
      title: "Third person",
      prompt: hasText
        ? `Rewrite the following bio in third person (he/she/they) for use on company websites or speaker profiles.${contextPrompt} Original bio: "${currentText}"`
        : `Generate a third-person professional bio${hasContext ? ` for someone with ${contextString}` : ""} suitable for company websites, speaker profiles, or press releases.`,
    },
    {
      allowMarkdown: true,
      title: "Industry focus",
      prompt: hasText
        ? `Refine the following bio to emphasize industry-specific expertise and keywords that would resonate with peers and recruiters in the same field.${contextPrompt} Original bio: "${currentText}"`
        : `Generate a bio that highlights industry-specific expertise and keywords${hasContext ? ` for someone with ${contextString}` : ""}. Make it resonate with peers and recruiters in their field.`,
    },
  ];
};
