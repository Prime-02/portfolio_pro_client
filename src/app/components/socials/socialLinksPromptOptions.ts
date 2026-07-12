import { PromptOption } from "../ai/AIAsistant";

// Function to generate prompt options with context of existing headline text
export const getHeadlineOptions = (
  currentText: string,
  url: string,
): PromptOption[] => {
  // Return empty array if no URL is provided
  if (!url) {
    return [];
  }

  const hasText = currentText.trim().length > 0;
  const platformContext = getPlatformContext(url);

  return [
    {
      title: "Improve writing",
      prompt: hasText
        ? `You are a social media strategist and micro-copy specialist who understands that a great headline can dramatically increase click-through rates on portfolio social links. Rewrite this headline${platformContext} to be more polished, engaging, and effective at driving profile visits. Your revision should: correct any grammar, spelling, or clarity issues while maintaining the original intent, tighten the language so every word pulls its weight - no filler, no redundancy, use language that creates curiosity or conveys value (why should someone click this link?), strike a warm, professional tone that makes the portfolio owner seem approachable yet credible, and stay within a single short line that works as a visual label - concise enough to scan instantly but substantive enough to compel action. Think of this as the verbal equivalent of a well-designed button - it needs to look good, feel clickable, and communicate value in a glance. Do not use hashtags, line breaks, or multiple sentences. Keep the character count tight and impactful. Current headline: "${currentText}"`
        : `You are a social media strategist and micro-copy specialist who knows that the right headline can transform a passive social link into an active engagement driver. Generate an original, compelling headline for a portfolio's social links section${platformContext}. Your headline must accomplish several things simultaneously: immediately communicate why someone should click this link (what value, connection, or content awaits?), establish the portfolio owner's professional identity or personal brand in a few carefully chosen words, use language that is warm and inviting rather than corporate and transactional, stay under 60 characters so it works as a clean visual label, and avoid hashtags, line breaks, or multiple sentences. Think of this headline as the invitation text on a door - it should make people want to open it and step inside. The best headlines combine clarity with curiosity: clear enough to set expectations, intriguing enough to compel action.`,
    },
    {
      title: "Make shorter",
      prompt: hasText
        ? `You are a master of verbal compression who specializes in distilling messages to their most potent, memorable form. Condense this social links headline${platformContext} into a shorter, punchier version that hits harder with fewer words. Your compression process should: identify the absolute core message - the one thing this headline must communicate, eliminate every word that doesn't directly serve that core message, replace verbose phrases with tighter alternatives, and aim for under 40 characters while maintaining meaning and impact. The result should feel like a polished gem - small but brilliant, condensed but complete. Think of how magazine headlines, button labels, and navigation items communicate maximum meaning in minimum space. The shortened version should feel more powerful than the original because every remaining word carries more weight. Current headline: "${currentText}"`
        : `You are a master of verbal compression who can pack remarkable meaning into remarkably few characters. Write an ultra-short, punchy headline (under 40 characters) for a portfolio's social links section${platformContext}. This miniature headline must work hard: it should communicate the essence of why someone should click in the fewest possible words, use language that feels complete and satisfying despite its brevity, avoid abbreviations or truncation that feel rushed or incomplete, and stand alone as a polished, intentional piece of micro-copy. Think of the most effective short headlines you've encountered: "Follow my work," "Let's connect," "See what I'm building," "My latest projects." Simple, direct, complete thoughts compressed into their shortest viable form. Your headline should feel like a complete invitation, not a fragment. Do not use hashtags, line breaks, or emojis.`,
    },
    {
      title: "Make longer",
      prompt: hasText
        ? `You are a brand voice specialist who knows how to add meaningful personality and context to headlines without making them bloated. Expand this social links headline${platformContext} slightly to include more context, warmth, or personality while keeping it appropriate for a headline (a single line that scans quickly, not a paragraph or description). Your expansion should: add genuine value - context that helps someone understand what they'll find by clicking, personality that makes the headline feel human and unique, or warmth that makes the invitation feel personal, avoid padding with filler words that add length without substance, maintain the headline's scannability - it should still work as a quick visual label, and stay under 80 characters total. The expanded version should feel richer and more inviting than the original while remaining crisp enough to function as a headline rather than body text. Current headline: "${currentText}"`
        : `You are a brand voice specialist who believes that the best headlines have just enough personality to feel human while remaining scannable. Write a slightly more descriptive headline (under 80 characters) for a portfolio's social links section${platformContext} that adds a touch of warmth, personality, or context. Your headline should: go beyond the generic "Follow me on [Platform]" to say something more interesting or personal, give visitors a sense of what they'll find or why they should care, use language that reflects a genuine human voice rather than a template, and still function as a quick, scannable label - not a sentence or description. Think of this as the difference between a sign that says "Exit" and one that says "This way to something good." Both work as signs; one has personality. Keep it to a single line with no hashtags or line breaks.`,
    },
    {
      title: "Make catchy",
      prompt: hasText
        ? `You are a creative copywriter and engagement strategist who knows how to craft headlines that stick in the mind and drive action. Rewrite this social links headline${platformContext} to be catchier and more memorable - the kind of micro-copy that makes someone pause, smile, and click. Your rewrite should employ proven techniques for memorability: use rhythm, alliteration, or wordplay that makes the phrase pleasant and sticky, create a subtle pattern interrupt - something slightly unexpected that catches attention, balance cleverness with clarity (it still needs to communicate what the link is for), and maintain professionalism while being more engaging than a standard label. The headline should feel like it was written by a creative human, not generated from a dropdown menu of options. Think of it as the difference between "Contact" and "Let's make something great" - both communicate the same thing, but one is memorable. Current headline: "${currentText}"`
        : `You are a creative copywriter and engagement strategist who specializes in crafting headlines that people remember and act on. Generate a catchy, memorable headline for a portfolio's social links section${platformContext} that makes visitors genuinely want to click through. Your headline should employ one or more proven engagement techniques: curiosity gap - hint at something interesting without fully revealing it, emotional resonance - tap into a feeling or aspiration your audience shares, clever wordplay - use rhythm, rhyme, alliteration, or a twist on a familiar phrase, direct invitation - make the visitor feel personally welcomed or addressed, or value proposition - quickly communicate what's in it for them. The headline should feel original and specific to the portfolio owner, not a generic template that could apply to anyone. It should work at a glance but reward a second look. Keep it under 60 characters, single line, no hashtags. Make it the kind of headline that makes someone think "I want to see what this person is about."`,
    },
    {
      title: "Fix tone",
      prompt: hasText
        ? `You are a professional communications coach who specializes in helping people find the perfect tone for their professional presence. Rewrite this social links headline${platformContext} to achieve an ideal professional yet friendly tone - warm enough to be inviting, professional enough to be credible. Your tonal adjustments should: warm up any cold, corporate, or transactional language into something that feels human and genuine, eliminate any overly casual or slangy language that might undermine professional credibility, strike the sweet spot between "stiff and formal" and "too casual to take seriously," use language that sounds like one professional talking to another, not a brand talking to a consumer, and maintain the original message and intent while shifting only the tone. The revised headline should make visitors feel like they're being invited to connect by a real person they'd enjoy working with - someone who is both capable and approachable. Current headline: "${currentText}"`
        : `You are a professional communications coach who knows that tone is everything in micro-copy - the wrong tone can make a profile feel unapproachable or untrustworthy; the right tone makes people want to connect. Generate a warm, professional headline for a portfolio's social links section${platformContext} that strikes the perfect balance between friendly and credible. Your headline should embody these tonal qualities: warmth without oversharing - it should feel personal but not inappropriately intimate, confidence without arrogance - it should convey capability without bragging, professionalism without stiffness - it should be polished but not corporate or robotic, and invitation without desperation - it should welcome connection without begging for it. Think of the tone you'd use when introducing yourself at a professional networking event: you want to be remembered as both competent and pleasant to talk to. Keep it under 60 characters, single line, no hashtags. The headline should make someone think "this seems like a good person to know professionally."`,
    },
    {
      title: "Add call-to-action",
      prompt: hasText
        ? `You are a conversion optimization specialist and CTA copywriter who knows that the right call-to-action can dramatically increase click-through and engagement rates. Rework this social links headline${platformContext} to incorporate a subtle, natural call-to-action that encourages visitors to connect, follow, or engage. Your CTA integration should: weave the call-to-action into the headline organically rather than bolting it on as an afterthought, use invitational rather than demanding language ("Let's connect" not "Connect now"), make the visitor feel that clicking through benefits them (value proposition) rather than just the portfolio owner, keep the headline short and scannable despite adding the CTA element, and avoid clichéd CTA phrases that have lost their impact through overuse. The revised headline should make the desired action feel like a natural, appealing next step rather than an obligation. Current headline: "${currentText}"`
        : `You are a conversion optimization specialist and CTA copywriter who understands the psychology of micro-actions - the small decisions visitors make about whether to click, scroll, or move on. Write a headline for a portfolio's social links section${platformContext} that includes a subtle, irresistible call-to-action to connect or follow. Your headline must accomplish several psychological objectives: reduce friction - make the action feel easy, natural, and low-commitment, create a micro-incentive - hint at what the visitor gains by clicking (insights, inspiration, connection, collaboration), use soft, invitational language - "Let's connect," "Follow along," "See my work," "Join me on" rather than commanding language, make the visitor feel chosen or valued - like this invitation is extended to them specifically, and maintain a professional but warm tone that makes accepting the invitation feel good. The best CTAs don't feel like CTAs - they feel like a friend extending a genuine invitation. Keep it under 60 characters, single line, no hashtags.`,
    },
    {
      title: "Generate idea",
      prompt: `You are a creative director and headline specialist who has written thousands of headlines for portfolios, brands, and professional profiles. Generate an original, fresh headline idea for a portfolio's social links section${platformContext} that feels unlike anything from a template or generator. Your headline should: avoid the most common and overused patterns (no "Connect with me on [Platform]," "Follow my journey," "My [Platform] profile," or other templated phrases), sound like something a real, interesting human would actually write about themselves, reflect personality and professional identity in a way that makes the portfolio owner memorable, work effectively at under 60 characters as a clean visual label, and avoid hashtags, emojis, and line breaks (pure text craft). Think about what would make you actually want to click a social link on someone's portfolio. What headline would make you curious? What would make you think "this person seems interesting, let me see more"? Generate something that stands out from the sea of "Follow me" and "Connect here" that everyone else uses. Provide only the headline with no explanation.`,
    },
    {
      title: "Add emoji",
      prompt: hasText
        ? `You are a visual communication specialist who understands the strategic use of emojis in professional micro-copy. Add one or two carefully selected, contextually appropriate emojis to this social links headline${platformContext} to enhance visual appeal and emotional resonance without diminishing professionalism. Your emoji selection should: choose emojis that genuinely enhance or reinforce the headline's message (not random decoration), use emojis that are appropriate for the platform and professional context, place them naturally where they serve as visual punctuation or emotional emphasis, follow the "less is more" principle - one or two emojis enhance; more than that clutter and cheapen, and ensure the headline remains professional and readable even with the emojis added. Think of emojis like seasoning - the right amount enhances the dish; too much ruins it. Current headline: "${currentText}"`
        : `You are a visual communication specialist who knows that emojis, used strategically, can add warmth, personality, and visual interest to professional headlines without undermining credibility. Create a short, engaging headline with one or two well-chosen emojis for a portfolio's social links section${platformContext}. Your headline should: use emojis purposefully - each emoji should serve a clear communication function (reinforcing the message, adding emotional tone, creating visual interest), select emojis that are appropriate for a professional portfolio context (avoid overly casual, ambiguous, or potentially unprofessional emojis), integrate emojis naturally into the text flow rather than using them as separate decorative elements, and keep the headline scannable and clean despite the addition of visual elements. The emojis should feel like a natural extension of the headline's personality, not like stickers added as an afterthought. Keep the total character count under 60 (including emojis). No hashtags, single line. The headline should still work professionally even if the emojis were removed.`,
    },
    {
      title: "Make playful",
      prompt: hasText
        ? `You are a personal branding specialist who helps professionals show personality without sacrificing credibility. Rewrite this social links headline${platformContext} with a more playful, personable voice while keeping it appropriate for a professional portfolio. Your playful rewrite should: inject genuine personality - wit, warmth, or whimsy that feels authentic rather than forced, maintain the professional credibility of the portfolio (this isn't a casual social media account; it's a professional presence), use language that makes the portfolio owner seem like someone others would enjoy working with, avoid crossing into unprofessional territory (no slang that could alienate, no humor that could fall flat or offend), and keep the headline scannable and effective as a label. The goal is to be memorable and human, not silly or unprofessional. Think of the difference between a LinkedIn profile that sounds like it was written by a corporate robot versus one written by an actual human with a personality. Current headline: "${currentText}"`
        : `You are a personal branding specialist who believes that professionalism and personality are not mutually exclusive - the most memorable professionals are those who can be both credible and human. Generate a playful but professional headline for a portfolio's social links section${platformContext} that shows personality while maintaining credibility. Your headline should: reveal something about the person behind the portfolio - their attitude, energy, or perspective, use language that is warm, human, and maybe slightly unexpected (a small surprise that makes someone smile), avoid any humor or playfulness that could be misinterpreted or that undermines the person's professional authority, still clearly function as a social link label (playful doesn't mean vague or confusing), and keep under 60 characters, single line, no hashtags. Think of this as the headline equivalent of a professional who wears a subtly interesting accessory with an otherwise classic outfit - it shows personality without undermining the overall professional impression. The headline should make someone think "I'd enjoy working with this person" while still thinking "this person is serious about their work."`,
    },
  ];
};

// Helper function to extract platform context from URL
function getPlatformContext(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Phone number detection for tel: protocol
    if (urlObj.protocol === "tel:") {
      return " for a phone number link";
    }

    // Phone number detection via regex (looks for patterns like +1234567890, etc.)
    if (
      /^\+?[\d\s\-\(\)\.]{7,}$/.test(hostname) ||
      /^\+?[\d\s\-\(\)\.]{7,}$/.test(url)
    ) {
      return " for a phone number link";
    }

    if (hostname.includes("twitter.com") || hostname.includes("x.com")) {
      return " for a Twitter/X profile link";
    }
    if (hostname.includes("linkedin.com")) {
      return " for a LinkedIn profile link";
    }
    if (hostname.includes("github.com")) {
      return " for a GitHub profile link";
    }
    if (hostname.includes("instagram.com")) {
      return " for an Instagram profile link";
    }
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      return " for a YouTube channel link";
    }
    if (hostname.includes("facebook.com")) {
      return " for a Facebook profile link";
    }
    if (hostname.includes("tiktok.com")) {
      return " for a TikTok profile link";
    }
    if (hostname.includes("dribbble.com")) {
      return " for a Dribbble portfolio link";
    }
    if (hostname.includes("behance.net")) {
      return " for a Behance portfolio link";
    }
    if (hostname.includes("medium.com")) {
      return " for a Medium profile link";
    }
    if (hostname.includes("whatsapp.com") || hostname.includes("wa.me")) {
      return " for a WhatsApp contact link";
    }

    // Extract just the domain name for generic platforms
    const domain = hostname.replace("www.", "");
    return ` for a ${domain} link`;
  } catch {
    // Phone number detection for malformed URLs
    if (url.startsWith("tel:")) {
      return " for a phone number link";
    }

    // Detect raw phone numbers (e.g., +1 (555) 123-4567, 5551234567, etc.)
    const cleanNumber = url.replace(/[\s\-\(\)\.]/g, "");
    if (/^\+?\d{7,15}$/.test(cleanNumber)) {
      return " for a phone number link";
    }

    // If URL parsing fails, try to extract platform name from the string
    if (url.includes("twitter") || url.includes("x.com"))
      return " for a Twitter/X profile link";
    if (url.includes("linkedin")) return " for a LinkedIn profile link";
    if (url.includes("github")) return " for a GitHub profile link";
    if (url.includes("instagram")) return " for an Instagram profile link";
    if (url.includes("youtube")) return " for a YouTube channel link";
    if (url.includes("facebook")) return " for a Facebook profile link";
    if (url.includes("whatsapp") || url.includes("wa.me"))
      return " for a WhatsApp contact link";

    return "";
  }
}
