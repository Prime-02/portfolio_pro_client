import { PromptOption } from "../ai/AIAsistant";

export const getPortfolioDescriptionOptions = (
  currentText: string,
  portfolioTitle: string,
): PromptOption[] => {
  const trimmedText = currentText.trim();
  const trimmedTitle = portfolioTitle.trim();
  const hasTitle = trimmedTitle.length > 0;
  const hasText = trimmedText.length > 0;
  const hasValidWords = /\w{2,}/.test(trimmedText);

  if (!hasTitle || !hasText || !hasValidWords) {
    return [];
  }

  return [
    {
      title: "Make it concise",
      prompt: `You are an expert in professional portfolio presentation and executive communication, skilled at distilling verbose portfolio descriptions into tight, impactful summaries that respect the reader's time while conveying maximum value. Your task is to make the following portfolio description for "${trimmedTitle}" more concise without sacrificing substance. Cut filler phrases, eliminate redundancy, tighten verbose constructions, and remove any language that doesn't earn its place on the page. Every remaining word should serve a clear purpose in communicating what this professional does, what they've accomplished, and why it matters. The result should be sharp, scannable, and confident—the kind of description that commands attention from recruiters, clients, or collaborators who are reviewing dozens of portfolios. Preserve all key details about skills, achievements, industry focus, and value proposition. Output only the tightened description as plain text with no formatting, no labels, and no commentary.\n\nPortfolio: "${trimmedTitle}"\n\nDescription: "${trimmedText}"`,
    },
    {
      title: "Polish and proofread",
      prompt: `You are a meticulous editor specializing in professional portfolio content, with deep expertise in the conventions of business English and the expectations of hiring managers, clients, and industry peers. Your task is to correct all errors in grammar, spelling, punctuation, capitalization, and syntax in the following portfolio description for "${trimmedTitle}" while also smoothing out any awkward phrasing that would undermine the creator's professional credibility. Fix subject-verb agreement, tense consistency, misplaced modifiers, comma splices, run-on sentences, misspelled words (including commonly confused pairs), and inconsistent formatting. Additionally, address subtle issues that make writing feel unpolished: clunky transitions, slightly off prepositions, and minor word choice problems that a careful reader would notice. However, preserve the author's original meaning, voice, and strategic positioning—your job is to make them look meticulous and competent, not to rewrite their professional identity. Output only the polished description as plain text with no formatting, no labels, and no explanations.\n\nPortfolio: "${trimmedTitle}"\n\nDescription: "${trimmedText}"`,
    },
    {
      title: "Strengthen impact",
      prompt: `You are a portfolio strategist and professional branding expert who helps accomplished professionals present their work in the most compelling light possible. Your task is to strengthen the impact of the following portfolio description for "${trimmedTitle}" so it immediately conveys competence, credibility, and value. Focus on: replacing weak or tentative language with confident, declarative statements; transforming passive descriptions of work into active demonstrations of expertise and results; surfacing the unique value or perspective this professional brings; ensuring the opening line hooks the reader immediately; and structuring the description so the most impressive or differentiating elements come first. Where the original undersells achievements, bring them forward appropriately. Where the language feels generic, make it more specific and memorable. The strengthened version should make a recruiter or potential client think "I need to talk to this person" after reading it. Do not fabricate credentials, projects, or results not implied by the original. Output only the strengthened description as plain text with no formatting, no labels, and no explanations of your changes.\n\nPortfolio: "${trimmedTitle}"\n\nDescription: "${trimmedText}"`,
    },
    {
      title: "Tailor for audience",
      prompt: `You are a strategic communications advisor who helps professionals adapt their portfolio messaging for different audiences without losing authenticity. Your task is to read the following portfolio description for "${trimmedTitle}" and provide a brief strategic recommendation (2-4 sentences) on how the description could be reframed to resonate more strongly with a specific target audience. Consider who is most likely to view this portfolio—potential employers, freelance clients, collaborators, investors, grad school admissions, or industry peers—and identify the audience that would benefit most from a tailored approach. Your recommendation should: identify the likely primary audience for this portfolio based on the description's content and tone; suggest one specific shift in emphasis, framing, or language that would make the description more compelling to that audience; and briefly explain why that shift would matter. Write as a thoughtful advisor who understands both the professional's work and the audience's motivations. Output only the recommendation as plain text with no preamble, no labels, and no meta-commentary.\n\nPortfolio: "${trimmedTitle}"\n\nDescription: "${trimmedText}"`,
    },
    {
      title: "Reframe professionally",
      prompt: `You are a professional copywriter and career storyteller who excels at helping people articulate their work in fresh, compelling ways that feel authentic and original. Your task is to reframe the following portfolio description for "${trimmedTitle}"—express the same professional identity, skills, experience, and value using different language, structure, and emphasis while maintaining a polished, professional tone. This is not about changing the facts or the person's professional story; it's about presenting that story through a new lens that might reveal strengths or angles the original didn't highlight. You might reorganize the information, lead with a different aspect of their work, or express their value proposition in a fresher way. The reframed version should feel like the same professional described by an exceptionally skilled writer who found a new way into their story. Preserve all substantive information about their work, skills, and focus areas. Output only the reframed description as plain text with no formatting, no labels, and no commentary.\n\nPortfolio: "${trimmedTitle}"\n\nDescription: "${trimmedText}"`,
    },
  ];
};
