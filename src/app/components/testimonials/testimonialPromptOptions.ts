import { PromptOption } from "../ai/AIAsistant";

interface TestimonialContext {
  currentText?: string;
  authorName?: string;
  authorTitle?: string;
  authorCompany?: string;
  authorRelationship?: string; // e.g., "Colleague", "Client", "Manager"
  rating?: number; // 1-5
  recipientUsername?: string; // The person the testimonial is for
}

// Function to generate prompt options with context of existing testimonial
export const getTestimonialPromptOptions = (
  context: TestimonialContext = {},
): PromptOption[] => {
  const {
    currentText = "",
    authorName,
    authorTitle,
    authorCompany,
    authorRelationship,
    rating,
    recipientUsername,
  } = context;

  const hasText = currentText.trim().length > 0;
  const hasContext =
    authorName ||
    authorTitle ||
    authorCompany ||
    authorRelationship ||
    recipientUsername;

  // Return empty array if no proper words/content detected
  if (!hasText && !hasContext) {
    return [];
  }

  // Build context string for prompts
  const buildContextString = () => {
    const parts: string[] = [];
    if (authorName) parts.push(`author: ${authorName}`);
    if (authorTitle) parts.push(`title: ${authorTitle}`);
    if (authorCompany) parts.push(`company: ${authorCompany}`);
    if (authorRelationship) parts.push(`relationship: ${authorRelationship}`);
    if (recipientUsername) parts.push(`for: ${recipientUsername}`);
    if (rating !== undefined) parts.push(`rating: ${rating}/5`);
    return parts.join(", ");
  };

  const contextString = buildContextString();
  const contextPrompt = hasContext ? ` Context: ${contextString}.` : "";

  return [
    {
      title: "Professional testimonial",
      prompt: hasText
        ? `Rewrite the following testimonial to be more professional and impactful while preserving the authentic voice and key message.${contextPrompt} Original testimonial: "${currentText}"`
        : `Generate a professional and authentic testimonial${hasContext ? ` for ${contextString}` : ""}. Keep it warm but polished, highlight specific strengths, and make it suitable for a professional profile.`,
    },
    {
      title: "Make concise",
      prompt: hasText
        ? `Condense the following testimonial into a shorter, punchier version (2-3 sentences max) while keeping the most impactful praise.${contextPrompt} Original testimonial: "${currentText}"`
        : `Write a short, punchy testimonial (2-3 sentences)${hasContext ? ` from ${contextString}` : ""} that packs a strong endorsement.`,
    },
    {
      title: "Make detailed",
      prompt: hasText
        ? `Expand the following testimonial with more detail about the working relationship, specific examples, and why the recommendation is strong.${contextPrompt} Original testimonial: "${currentText}"`
        : `Generate a detailed testimonial${hasContext ? ` for ${contextString}` : ""}. Include specific examples of their work, skills demonstrated, and what made the experience positive. Keep it under 2000 characters.`,
    },
    {
      title: "Results focused",
      prompt: hasText
        ? `Rewrite the following testimonial to emphasize measurable results, impact, or specific outcomes achieved while working together.${contextPrompt} Original testimonial: "${currentText}"`
        : `Generate a results-focused testimonial${hasContext ? ` for ${contextString}` : ""}. Highlight measurable outcomes, contributions, or specific improvements they made.`,
    },
    {
      title: "Story-driven",
      prompt: hasText
        ? `Transform the following testimonial into a compelling mini-story with a beginning (how you started working together), middle (the challenge or project), and result (the positive outcome).${contextPrompt} Original testimonial: "${currentText}"`
        : `Create a story-driven testimonial${hasContext ? ` for ${contextString}` : ""} following a beginning-middle-result format. Make it engaging and relatable.`,
    },
    {
      title: "Casual & authentic",
      prompt: hasText
        ? `Rewrite the following testimonial in a more casual, conversational tone while keeping it genuine. Make it sound like a real person talking about someone they enjoyed working with.${contextPrompt} Original testimonial: "${currentText}"`
        : `Generate a casual, authentic testimonial${hasContext ? ` for ${contextString}` : ""}. Make it sound like genuine word-of-mouth praise from someone who knows their work well.`,
    },
    {
      title: "LinkedIn recommendation",
      prompt: hasText
        ? `Reformat the following testimonial as a LinkedIn recommendation with a professional yet personal tone. Make it suitable for their LinkedIn profile.${contextPrompt} Original testimonial: "${currentText}"`
        : `Write a LinkedIn recommendation${hasContext ? ` for ${contextString}` : ""}. Make it professional, credible, and highlight specific strengths and what it was like working with them.`,
    },
    {
      title: "Highlight skills",
      prompt: hasText
        ? `Enhance the following testimonial to specifically highlight key skills, strengths, and qualities demonstrated. Be specific about what makes this person stand out.${contextPrompt} Original testimonial: "${currentText}"`
        : `Generate a testimonial${hasContext ? ` for ${contextString}` : ""} that highlights specific skills, strengths, and qualities. Be detailed about what makes them exceptional to work with.`,
    },
    {
      title: "Leadership praise",
      prompt: hasText
        ? `Rewrite the following testimonial to emphasize leadership qualities, team impact, and ability to inspire or guide others.${contextPrompt} Original testimonial: "${currentText}"`
        : `Generate a testimonial${hasContext ? ` for ${contextString}` : ""} focusing on leadership qualities, team impact, and their ability to inspire or guide others.`,
    },
    {
      title: "Diverse angles",
      prompt: hasText
        ? `Generate 3 different variations of the following testimonial, each with a slightly different angle: one emphasizing work quality, one on collaboration/teamwork, and one on reliability/professionalism.${contextPrompt} Original testimonial: "${currentText}"`
        : `Generate 3 testimonial variations${hasContext ? ` for ${contextString}` : ""} with different angles: one on work quality, one on collaboration, and one on reliability/professionalism.`,
    },
  ];
};
