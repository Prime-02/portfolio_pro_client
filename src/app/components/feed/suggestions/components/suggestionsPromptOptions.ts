import { PromptOption } from "../../../ai/AIAsistant";

export const getSuggestionOptions = (currentText: string): PromptOption[] => {
  const trimmedText = currentText.trim();
  const hasText = trimmedText.length > 0;
  const hasValidWords = /\w{2,}/.test(trimmedText);

  if (!hasText || !hasValidWords) {
    return [];
  }

  return [
    {
      title: "Simplify",
      prompt: `Rewrite the following text to be simpler and easier to understand, preserving its core meaning. Output only the rewritten text, with no formatting, labels, or commentary.\n\nText: "${trimmedText}"`,
    },
    {
      title: "Fix grammar",
      prompt: `Rewrite the following text with grammar, spelling, and punctuation errors corrected. Do not change the meaning or tone. Output only the corrected text, with no formatting, labels, or commentary.\n\nText: "${trimmedText}"`,
    },
    {
      title: "Suggest improvement",
      prompt: `Rewrite the following text to be clearer, more engaging, and better structured. Output only the improved version as plain text — do not list separate suggestions, do not explain what you changed or why, do not use any markdown or numbering.\n\nText: "${trimmedText}"`,
    },
    {
      title: "Offer perspective",
      prompt: `Write one short paragraph (2-4 sentences) offering an alternative angle or additional idea related to the following text. Output only that paragraph as plain text, with no preamble, labels, or formatting.\n\nText: "${trimmedText}"`,
    },
    {
      title: "Rephrase",
      prompt: `Rephrase the following text in a fresh, natural way while keeping the same meaning. Output only the rephrased text, with no formatting, labels, or commentary.\n\nText: "${trimmedText}"`,
    },
  ];
};
