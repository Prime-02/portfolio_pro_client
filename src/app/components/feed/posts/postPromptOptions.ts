import { PromptOption } from "../../ai/AIAsistant";

// Function to generate prompt options with context of existing text
  export const getPromptOptions = (currentText: string): PromptOption[] => {
    const hasText = currentText.trim().length > 0;

    return [
      {
        title: "Improve writing",
        prompt: hasText
          ? `Rewrite the following text to be more engaging and professional while maintaining the original meaning. Fix any grammar issues and improve clarity: "${currentText}"`
          : "Generate an engaging and professional social media post about technology, productivity, or personal growth. Make it thought-provoking and under 280 characters."
      },
      {
        title: "Make shorter",
        prompt: hasText
          ? `Condense the following text into a shorter, more concise version while keeping the key message intact: "${currentText}"`
          : "Write a short, impactful social media post (under 150 characters) that sparks curiosity."
      },
      {
        title: "Make longer",
        prompt: hasText
          ? `Expand on the following text by adding more detail, context, and engaging elements while staying on topic: "${currentText}"`
          : "Write a detailed and engaging social media post about an interesting topic, including examples and thought-provoking questions."
      },
      {
        title: "Add hashtags",
        prompt: hasText
          ? `Based on the following text, suggest 3-5 relevant and trending hashtags that would increase visibility. Return only the hashtags separated by spaces: "${currentText}"`
          : "Suggest 5 trending and relevant hashtags for a post about technology and innovation. Return only the hashtags separated by spaces."
      },
      {
        title: "Fix tone",
        prompt: hasText
          ? `Rewrite the following text to have a professional and friendly tone while keeping the same message: "${currentText}"`
          : "Generate a friendly and professional social media post sharing an interesting insight or tip."
      },
      {
        title: "Generate idea",
        prompt: "Generate an engaging social media post idea. Keep it under 280 characters and make it thought-provoking. Don't include hashtags."
      },
      {
        title: "Add emojis",
        prompt: hasText
          ? `Add appropriate and relevant emojis to the following text to make it more engaging and visually appealing. Keep it natural and don't overdo it: "${currentText}"`
          : "Create a fun and engaging social media post with appropriate emojis about a positive topic."
      },
      {
        title: "Question post",
        prompt: hasText
          ? `Transform the following text into an engaging question that encourages discussion and comments from readers: "${currentText}"`
          : "Create an engaging question post that sparks discussion about technology, career growth, or personal development."
      },
      {
        title: "Thread opener",
        prompt: hasText
          ? `Transform the following text into an engaging thread opener (first tweet/post) that makes people want to read more. Add "🧵" at the end: "${currentText}"`
          : "Create an engaging thread opener about an interesting insight or lesson learned. Make it compelling enough to make people want to read the full thread. Add 🧵 at the end."
      },
    ];
}
