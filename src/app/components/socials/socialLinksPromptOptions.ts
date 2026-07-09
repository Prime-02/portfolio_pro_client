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
        ? `Rewrite the following social links headline to be more engaging and professional while keeping the same meaning. Fix any grammar issues and improve clarity. Keep it a single short line${platformContext}: "${currentText}"`
        : `Generate an engaging, professional headline for a portfolio's social links section${platformContext}. Keep it under 60 characters, single line, no hashtags.`,
    },
    {
      title: "Make shorter",
      prompt: hasText
        ? `Condense the following social links headline into a shorter, punchier version while keeping the key message intact. Aim for under 40 characters${platformContext}: "${currentText}"`
        : `Write a very short, punchy headline (under 40 characters) for a portfolio's social links section${platformContext}.`,
    },
    {
      title: "Make longer",
      prompt: hasText
        ? `Expand the following social links headline slightly with more context or personality, while keeping it a single line suitable for a headline (not a paragraph)${platformContext}: "${currentText}"`
        : `Write a slightly more descriptive headline (under 80 characters) for a portfolio's social links section${platformContext}, adding a touch of personality.`,
    },
    {
      title: "Make catchy",
      prompt: hasText
        ? `Rewrite the following social links headline to be catchier and more memorable, keeping the core meaning${platformContext}: "${currentText}"`
        : `Generate a catchy, memorable headline for a portfolio's social links section${platformContext} that makes people want to click through.`,
    },
    {
      title: "Fix tone",
      prompt: hasText
        ? `Rewrite the following social links headline to have a professional and friendly tone while keeping the same message${platformContext}: "${currentText}"`
        : `Generate a friendly and professional headline for a portfolio's social links section${platformContext}.`,
    },
    {
      title: "Add call-to-action",
      prompt: hasText
        ? `Rework the following social links headline to include a subtle call-to-action encouraging visitors to connect or follow, while keeping it short${platformContext}: "${currentText}"`
        : `Write a headline for a portfolio's social links section${platformContext} that includes a subtle call-to-action to connect or follow.`,
    },
    {
      title: "Generate idea",
      prompt: `Generate an original headline idea for a portfolio's social links section${platformContext}. Keep it under 60 characters and don't include hashtags.`,
    },
    {
      title: "Add emoji",
      prompt: hasText
        ? `Add one or two appropriate emojis to the following social links headline to make it more visually engaging, without overdoing it${platformContext}: "${currentText}"`
        : `Create a short, engaging headline with one or two appropriate emojis for a portfolio's social links section${platformContext}.`,
    },
    {
      title: "Make playful",
      prompt: hasText
        ? `Rewrite the following social links headline with a more playful, personable voice while keeping it professional enough for a portfolio${platformContext}: "${currentText}"`
        : `Generate a playful but professional headline for a portfolio's social links section${platformContext}.`,
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
    if (/^\+?[\d\s\-\(\)\.]{7,}$/.test(hostname) || /^\+?[\d\s\-\(\)\.]{7,}$/.test(url)) {
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