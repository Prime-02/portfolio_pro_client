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

  // Return empty array if any non-context fields lack value
  if (!profession || !jobTitle || !yearsOfExperience) {
    return [];
  }

  const hasText = currentText.trim().length > 0;

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

  return [
    {
      allowMarkdown: true,
      title: "Professional bio",
      prompt: hasText
        ? `You are an expert personal branding strategist and professional copywriter. I need you to completely rewrite and elevate the following professional bio to make it significantly more polished, impactful, and compelling. Your task is to transform it into a powerful narrative that immediately captures attention and establishes credibility. Focus on creating a strong opening hook, weaving in their unique value proposition, showcasing their expertise in ${profession} as a ${jobTitle} with ${yearsOfExperience} of experience, and ending with a memorable closing statement. The tone should be confident but not arrogant, professional but not stiff, and highlight both their technical capabilities and human qualities. Ensure the language is active and dynamic, avoiding passive constructions and generic buzzwords. Context: ${contextString}. Original bio: "${currentText}"`
        : `You are an expert personal branding strategist and professional copywriter. Generate a comprehensive and captivating professional bio for a ${jobTitle} with ${yearsOfExperience} of experience in ${profession}. Craft a compelling narrative that opens with a powerful hook, establishes their authority and unique perspective in the field, showcases their professional journey and key milestones, highlights their core strengths and specialized expertise, and concludes with their professional philosophy or vision. The bio should feel authentic, sophisticated, and memorable - the kind that makes recruiters and potential clients immediately want to learn more. Avoid clichés and generic statements; instead focus on what makes someone in this role truly exceptional. Keep it under 2000 characters and format it professionally with proper paragraph breaks. Context: ${contextString}.`,
    },
    {
      allowMarkdown: true,
      title: "Make concise",
      prompt: hasText
        ? `You are a master editor specializing in professional communications. Take the following bio and distill it down to its absolute essence - I want the most powerful, punchy version possible in just 2-3 tightly crafted sentences. Every word must earn its place. Your goal is to create a "mic drop" bio that instantly communicates who this person is, what they do, their unique edge as a ${jobTitle} in ${profession}, and why it matters - all in one breath. Cut all filler, eliminate redundancies, and replace weak language with vivid, action-oriented alternatives. Think of this as their verbal business card or the one thing they'd say if they only had 15 seconds to impress their dream employer. Context: ${contextString}. Original bio: "${currentText}"`
        : `You are a master editor specializing in professional communications. Create a razor-sharp, ultra-concise professional bio (2-3 sentences maximum) for a ${jobTitle} in ${profession} with ${yearsOfExperience} of experience. This needs to be their "elevator pitch on paper" - the distilled essence of their professional identity that hits hard and leaves a lasting impression. Every word must pull double duty: conveying information while building intrigue. Start with their role and core differentiator, follow with a key achievement or capability that proves their expertise, and close with the impact they create or the problems they solve. Think of this as what would appear under their name at a TED talk or in a featured industry spotlight. Context: ${contextString}.`,
    },
    {
      allowMarkdown: true,
      title: "Make detailed",
      prompt: hasText
        ? `You are a professional biographer and narrative storyteller who specializes in crafting rich, multidimensional professional profiles. Take the current bio as a foundation and expand it into a comprehensive, compelling professional narrative. I want you to add depth, texture, and personality while maintaining absolute professionalism. Explore their journey as a ${jobTitle} in ${profession} - include formative experiences, pivotal career moments, philosophy of work, approach to challenges, and vision for their field. Weave in specific achievements and their significance, key skills and how they've been applied, professional values, and what drives their passion for ${profession}. The expanded bio should feel like a well-crafted story where the reader walks away feeling they truly understand this professional's journey, capabilities, and unique perspective. Context: ${contextString}. Original bio: "${currentText}"`
        : `You are a professional biographer and narrative storyteller who specializes in crafting rich, multidimensional professional profiles. Create a detailed, narrative-driven professional bio for a ${jobTitle} with ${yearsOfExperience} in ${profession}. Go beyond surface-level credentials to paint a complete picture of a dedicated professional: their origin story and what drew them to this field, the evolution of their expertise over ${yearsOfExperience}, landmark projects or achievements that showcase their growth, their professional methodology and approach to problem-solving, the impact they've had on organizations, teams, or clients, their thought leadership or unique perspectives on ${profession}, and their aspirations or the legacy they're building. The bio should be substantive and sophisticated, reading like a featured profile in an industry publication. Keep it under 2000 characters. Context: ${contextString}.`,
    },
    {
      allowMarkdown: true,
      title: "Add achievements",
      prompt: hasText
        ? `You are a results-focused career strategist and executive resume writer. Transform this bio into a compelling, achievement-driven professional summary that quantifies impact and demonstrates proven excellence. Your mission is to infuse the narrative with concrete accomplishments, measurable results, and tangible proof of expertise as a ${jobTitle} in ${profession}. For each capability mentioned, ask "what was the result?" and incorporate that evidence seamlessly into the storytelling. Use powerful metrics (percentages, dollar amounts, time saved, teams led, revenue generated, efficiency improvements) to create a track record of undeniable success. The bio should make readers think "this person doesn't just do the job, they deliver exceptional results." Format achievement highlights naturally within the narrative flow, not as a bulleted list. Context: ${contextString}. Original bio: "${currentText}"`
        : `You are a results-focused career strategist and executive resume writer. Generate a powerful, achievement-laden professional bio for a ${jobTitle} in ${profession} with ${yearsOfExperience} of experience. This bio must be built around a foundation of concrete accomplishments, quantified impacts, and demonstrated excellence. Structure it around key result areas: business impact and value creation, innovation and problem-solving wins, leadership and team development successes, client or stakeholder transformations, and professional recognition or industry contributions. For each area, craft compelling narrative statements that incorporate specific, believable metrics and outcomes that would be impressive for someone at this level and tenure. The bio should read as a highlight reel of career-defining moments that prove this person is in the top percentile of their field. Use confident, active language that conveys both competence and ambition. Context: ${contextString}.`,
    },
    {
      allowMarkdown: true,
      title: "Casual tone",
      prompt: hasText
        ? `You are a conversational copywriter who specializes in making professional profiles feel human, warm, and genuinely relatable. Rewrite this bio in a casual, approachable, and authentic voice that feels like someone describing what they do to a new friend over coffee - professional enough to be taken seriously, but personal enough to be memorable and likable. Strip away corporate stiffness, buzzwords, and formal pretenses. Instead, bring out their personality, share what genuinely excites them about being a ${jobTitle} in ${profession}, mention what a typical day looks like in a relatable way, hint at their work style and what it's like to collaborate with them, and include a touch of humor or warmth where appropriate. The reader should feel like they're getting to know a real person, not reading a corporate document. Context: ${contextString}. Original bio: "${currentText}"`
        : `You are a conversational copywriter who specializes in making professional profiles feel human, warm, and genuinely relatable. Create a casual, authentic professional bio for a ${jobTitle} in ${profession} with ${yearsOfExperience} of experience. Write it as if they're introducing themselves at a relaxed networking event or writing their "about me" for a creative portfolio site. The tone should be warm, approachable, and slightly informal while still conveying competence and professionalism. Include elements like: what they love most about their work, a brief anecdote or insight that reveals their personality, what drives them beyond just the job title, the kinds of problems they enjoy solving, and the types of people or projects they're most excited to work with. Make it feel like the start of a great professional relationship rather than a sterile credential list. Use contractions, varied sentence lengths, and a natural conversational rhythm. Context: ${contextString}.`,
    },
    {
      allowMarkdown: true,
      title: "Open to work",
      prompt: hasText
        ? `You are a career transition strategist and recruitment marketing specialist. Revise this bio to strategically and compellingly signal that this professional is actively open to new opportunities, while maintaining their value and positioning them as a highly desirable candidate. As a ${jobTitle} in ${profession} with ${yearsOfExperience} of experience, they bring significant expertise to the table. The updated bio should: naturally weave in their openness to the right opportunity without sounding desperate or junior, include a subtle but clear call-to-action that invites the right kinds of outreach (specific roles, industries, or collaboration types), frame their job search as a strategic career move driven by ambition and readiness for greater impact, and maintain their authority and thought leadership position throughout. The language should position them as a sought-after professional exploring their next chapter, not someone simply looking for any job. Context: ${contextString}. Original bio: "${currentText}"`
        : `You are a career transition strategist and recruitment marketing specialist. Create a compelling professional bio for a ${jobTitle} in ${profession} with ${yearsOfExperience} of experience that strategically communicates they are open to new work opportunities. The challenge is to signal availability while maintaining premium positioning - they're not just job seeking, they're selectively exploring their next impactful role. Craft a bio that: establishes their expertise and track record upfront to build immediate credibility, gracefully transitions into their current career exploration, frames their availability as a limited-time opportunity for the right organization to secure top talent, specifies the types of opportunities, challenges, or industries they're most excited about, includes a warm but professional invitation to connect or reach out, and maintains an optimistic, forward-looking tone that suggests exciting things ahead. The overall impression should be "this is someone you'd be lucky to hire" not "someone who needs a job." Context: ${contextString}.`,
    },
    {
      allowMarkdown: true,
      title: "LinkedIn headline",
      prompt: hasText
        ? `You are a LinkedIn optimization expert and personal branding strategist. Transform the essence of this bio into a scroll-stopping LinkedIn headline that commands attention in a crowded feed and compels profile clicks. You have exactly 220 characters to work with, and every character must earn its place. Your headline must: lead with a powerful, keyword-rich title that immediately communicates their ${jobTitle} role and ${profession} expertise, incorporate their ${yearsOfExperience} of experience in a compelling way, include a unique value proposition or specialty that differentiates them, naturally embed high-value keywords recruiters and clients search for, and end with either a results statement or a forward-looking declaration. Use proven headline formulas: vertical bars (|), em dashes, or strategic formatting to pack maximum information cleanly. Study the original bio for unique angles and achievements to feature. Context: ${contextString}. Original bio: "${currentText}"`
        : `You are a LinkedIn optimization expert and personal branding strategist. Create a magnetic, search-optimized LinkedIn headline for a ${jobTitle} in ${profession} with ${yearsOfExperience} of experience. Your 220-character masterpiece must accomplish multiple objectives simultaneously: instantly communicate their professional identity and seniority level, feature their primary area of expertise and any specialized niche, incorporate industry-relevant keywords that improve searchability for recruiters and potential clients, convey their unique value proposition or what makes their approach different, and create intrigue that drives profile visits. Use strategic formatting with separators (|, •, —, or →) to organize information cleanly and create visual rhythm. The headline should work as hard as a 30-second elevator pitch, telling viewers exactly who they are, what they do, and why they matter. Consider including: role + specialization + key achievement metric + target audience or mission. Context: ${contextString}.`,
    },
    {
      allowMarkdown: true,
      title: "First person",
      prompt: hasText
        ? `You are a ghostwriter specializing in authentic first-person professional narratives. Transform this bio into a warm, personal, first-person account that feels like the professional is speaking directly to the reader. Write entirely using "I," "me," and "my" statements. As a ${jobTitle} in ${profession} with ${yearsOfExperience} of experience, their voice should convey both competence and genuine human connection. The narrative should: open with a personal mission statement or the "why" behind their work, share their professional philosophy and approach in their own voice, reflect on key experiences and what they learned, express genuine enthusiasm for ${profession} and the problems they solve, and close with an invitation for connection or collaboration. The tone should be confident yet humble, experienced yet still curious, professional yet deeply personal. Readers should feel like they just had a meaningful conversation with an impressive but approachable professional. Context: ${contextString}. Original bio: "${currentText}"`
        : `You are a ghostwriter specializing in authentic first-person professional narratives. Write a compelling first-person bio for a ${jobTitle} in ${profession} with ${yearsOfExperience} of experience. This is their chance to speak directly to their audience, so the voice must feel genuine, personal, and immediately likeable. Structure their story around these elements: the moment or realization that drew them to ${profession} (their "origin story"), how their perspective has evolved over ${yearsOfExperience} in the field, what their day-to-day work looks like and what energizes them about it, their proudest moments and biggest lessons learned, the principles or values that guide their professional decisions, what they believe about the future of ${profession}, and an open, warm invitation for readers to connect or collaborate. The writing should feel like a thoughtful professional reflecting on their journey - introspective but not self-indulgent, proud but not boastful, open but still professional. Use "I" statements throughout and maintain a consistent, authentic voice. Context: ${contextString}.`,
    },
    {
      allowMarkdown: true,
      title: "Third person",
      prompt: hasText
        ? `You are an executive communications specialist and professional profile writer for corporate publications. Transform this bio into a polished, authoritative third-person profile suitable for high-stakes professional contexts: company leadership pages, conference speaker introductions, board presentations, press releases, or industry award submissions. As a ${jobTitle} in ${profession} with ${yearsOfExperience} of experience, this professional deserves a profile that commands respect and communicates gravitas. Write using only third-person pronouns (he/she/they) and maintain a tone that is: impeccably professional and authoritative, appropriate for C-suite and board-level audiences, sophisticated without being pretentious, and structured like a formal professional biography. Include their current role and scope of responsibility, career trajectory and notable positions, key accomplishments and industry contributions, thought leadership and professional affiliations, and any relevant credentials or recognition. Context: ${contextString}. Original bio: "${currentText}"`
        : `You are an executive communications specialist and professional profile writer for corporate publications. Create a commanding third-person professional bio for a ${jobTitle} in ${profession} with ${yearsOfExperience} of experience, suitable for the most formal professional contexts: company website executive team pages, investor communications, industry conference materials, board nominations, or published articles. Write exclusively in third person (he/she/they). The bio should be structured as a formal professional biography with these elements: a prestigious opening that establishes their position and authority in ${profession}, a chronological or thematic overview of their career progression and increasing responsibility, notable companies, projects, or initiatives they've led, their management philosophy or approach to leadership, board memberships, industry awards, publications, or speaking engagements, educational background and professional certifications, and a closing statement about their ongoing impact or vision. The tone should be objective, factual, and deeply respectful - like a formal introduction at an industry lifetime achievement ceremony. Maintain perfect professional decorum throughout. Context: ${contextString}.`,
    },
    {
      allowMarkdown: true,
      title: "Industry focus",
      prompt: hasText
        ? `You are an industry insider and domain expert in ${profession} who understands exactly what language, concepts, and credentials signal credibility in this field. Rewrite this bio to speak powerfully to industry peers, specialized recruiters, and discerning clients who deeply understand ${profession}. Your goal is to demonstrate that this ${jobTitle} is not just experienced, but truly belongs to the inner circle of their industry. The bio should: use precise, field-specific terminology and frameworks that show deep domain knowledge, reference industry-standard methodologies, tools, or approaches they've mastered, signal awareness of current trends, challenges, and innovations in ${profession}, highlight specialized certifications, methodologies, or schools of thought they follow, and use insider language that makes peers nod in recognition. This bio should make other industry professionals think "this person really knows their craft" while still being partially accessible to a broader business audience. Context: ${contextString}. Original bio: "${currentText}"`
        : `You are an industry insider and domain expert in ${profession} who understands exactly what language, concepts, and credentials signal credibility in this field. Create a bio for a ${jobTitle} with ${yearsOfExperience} that resonates powerfully with industry insiders - the peers, specialized recruiters, and sophisticated clients who can spot generic fluff from a mile away. This bio must demonstrate deep, authentic domain expertise through: precise use of current industry terminology, frameworks, and methodologies, demonstrated understanding of the key challenges, trends, and transformations shaping ${profession} right now, references to the specific skills, tools, and approaches that matter most in this field, alignment with respected industry standards, certifications, or thought leaders, and an articulation of their unique perspective or contribution to the evolution of ${profession}. The language should be rich with industry context - not buzzwords, but genuine indicators of deep practice. Think of this as a bio that would earn the respect of a room full of their professional peers at an industry conference. Context: ${contextString}.`,
    },
  ];
};
