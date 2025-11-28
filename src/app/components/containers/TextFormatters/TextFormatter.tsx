import React, { useState, ReactNode } from "react";

interface TextFormatterProps {
  children: string;
  className?: string;
  characterLimit?: number;
  showSeeMore?: boolean;
}

interface FormatRule {
  pattern: RegExp;
  replacement: (match: string, content: string, index: string) => ReactNode;
  priority?: number;
}

interface SpoilerTextProps {
  content: string;
}

const TextFormatter: React.FC<TextFormatterProps> = ({
  children,
  className = "",
  characterLimit = 200,
  showSeeMore = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (typeof children !== "string") {
    return <span>{children}</span>;
  }

  // Determine if we need to truncate
  const shouldTruncate =
    showSeeMore && children.length > characterLimit && !isExpanded;

  // Get the text to display
  const displayText = shouldTruncate
    ? children.substring(0, characterLimit)
    : children;

  const formatText = (text: string): ReactNode[] => {
    // Handle line breaks and bullet points first
    const lines = text.split("\n");
    const processedLines = lines.map((line, lineIndex) => {
      const trimmedLine = line.trim();

      // Check for bullet patterns at start of line
      const bulletPatterns = [
        { pattern: /^[-•·‣⁃▪▫◦‧⁌⁍] (.+)/, bullet: "•" },
        { pattern: /^[*] (.+)/, bullet: "•" },
        { pattern: /^[+] (.+)/, bullet: "+" },
        { pattern: /^[→›»] (.+)/, bullet: "→" },
        { pattern: /^[✓✔] (.+)/, bullet: "✓" },
        { pattern: /^[✗✘] (.+)/, bullet: "✗" },
        { pattern: /^[◊◆] (.+)/, bullet: "◊" },
        { pattern: /^[▶▷] (.+)/, bullet: "▶" },
        { pattern: /^(\d+)\. (.+)/, bullet: null }, // Numbered list
      ];

      let isBulletPoint = false;
      let bulletContent = "";
      let bulletSymbol = "";

      for (const bulletPattern of bulletPatterns) {
        const match = trimmedLine.match(bulletPattern.pattern);
        if (match) {
          isBulletPoint = true;
          if (bulletPattern.bullet === null) {
            // Numbered list
            bulletSymbol = `${match[1]}.`;
            bulletContent = match[2];
          } else {
            bulletSymbol = bulletPattern.bullet;
            bulletContent = match[1];
          }
          break;
        }
      }

      // Apply inline formatting to the content
      const contentToFormat = isBulletPoint ? bulletContent : trimmedLine;
      const formattedContent = applyInlineFormatting(contentToFormat);

      if (isBulletPoint) {
        return (
          <div
            key={`line-${lineIndex}`}
            className="flex items-start space-x-2 my-1"
          >
            <span className="text-[var(--accent)] font-medium mt-0.5 flex-shrink-0">
              {bulletSymbol}
            </span>
            <span className="flex-1">{formattedContent}</span>
          </div>
        );
      } else if (trimmedLine === "") {
        return <br key={`line-${lineIndex}`} />;
      } else {
        return (
          <React.Fragment key={`line-${lineIndex}`}>
            {formattedContent}
            {lineIndex < lines.length - 1 && <br />}
          </React.Fragment>
        );
      }
    });

    return processedLines;
  };

  const applyInlineFormatting = (text: string): ReactNode[] => {
    // Define formatting rules with regex patterns and their corresponding JSX
    const formatRules: FormatRule[] = [
      // Bold with **text** or __text__
      {
        pattern: /\*\*(.*?)\*\*/g,
        replacement: (match, content, index) => (
          <strong key={`bold-${index}`} className="font-bold">
            {content}
          </strong>
        ),
        priority: 1,
      },
      {
        pattern: /__(.*?)__/g,
        replacement: (match, content, index) => (
          <strong key={`bold-under-${index}`} className="font-bold">
            {content}
          </strong>
        ),
        priority: 1,
      },
      // Italic with *text* or _text_ (but not if part of bold)
      {
        pattern: /(?<!\*)\*([^*]+?)\*(?!\*)/g,
        replacement: (match, content, index) => (
          <em key={`italic-${index}`} className="italic">
            {content}
          </em>
        ),
        priority: 2,
      },
      {
        pattern: /(?<!_)_([^_]+?)_(?!_)/g,
        replacement: (match, content, index) => (
          <em key={`italic-under-${index}`} className="italic">
            {content}
          </em>
        ),
        priority: 2,
      },
      // Strikethrough with ~~text~~
      {
        pattern: /~~(.*?)~~/g,
        replacement: (match, content, index) => (
          <span key={`strike-${index}`} className="line-through">
            {content}
          </span>
        ),
        priority: 3,
      },
      // Underline with ~text~ (single tilde)
      {
        pattern: /(?<!~)~([^~]+?)~(?!~)/g,
        replacement: (match, content, index) => (
          <span key={`underline-${index}`} className="underline">
            {content}
          </span>
        ),
        priority: 3,
      },
      // Code inline with `text`
      {
        pattern: /`([^`]+?)`/g,
        replacement: (match, content, index) => (
          <code
            key={`code-${index}`}
            className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono"
          >
            {content}
          </code>
        ),
        priority: 4,
      },
      // Highlight with ==text==
      {
        pattern: /==(.*?)==/g,
        replacement: (match, content, index) => (
          <mark key={`highlight-${index}`} className="bg-yellow-200 px-1">
            {content}
          </mark>
        ),
        priority: 5,
      },
      // Superscript with ^text^
      {
        pattern: /\^([^^]+?)\^/g,
        replacement: (match, content, index) => (
          <sup key={`sup-${index}`} className="text-xs">
            {content}
          </sup>
        ),
        priority: 6,
      },
      // Subscript with _{text}_
      {
        pattern: /_\{([^}]+?)\}_/g,
        replacement: (match, content, index) => (
          <sub key={`sub-${index}`} className="text-xs">
            {content}
          </sub>
        ),
        priority: 6,
      },
      // Small text with --text--
      {
        pattern: /--(.*?)--/g,
        replacement: (match, content, index) => (
          <small key={`small-${index}`} className="text-sm text-gray-600">
            {content}
          </small>
        ),
        priority: 7,
      },
      // Large text with ++text++
      {
        pattern: /\+\+(.*?)\+\+/g,
        replacement: (match, content, index) => (
          <span key={`large-${index}`} className="text-lg font-medium">
            {content}
          </span>
        ),
        priority: 7,
      },
      // Spoiler with ||text||
      {
        pattern: /\|\|(.*?)\|\|/g,
        replacement: (match, content, index) => (
          <SpoilerText key={`spoiler-${index}`} content={content} />
        ),
        priority: 8,
      },
      // Insert/Addition with {+text+}
      {
        pattern: /\{\+(.*?)\+\}/g,
        replacement: (match, content, index) => (
          <ins key={`insert-${index}`} className="bg-green-100 text-green-800">
            {content}
          </ins>
        ),
        priority: 9,
      },
      // Delete/Removal with {-text-}
      {
        pattern: /\{-(.*?)-\}/g,
        replacement: (match, content, index) => (
          <del key={`delete-${index}`} className="bg-red-100 text-red-800">
            {content}
          </del>
        ),
        priority: 9,
      },
      // Math inline with $text$
      {
        pattern: /\$([^$]+?)\$/g,
        replacement: (match, content, index) => (
          <span
            key={`math-${index}`}
            className="font-mono bg-blue-50 px-1 rounded italic"
          >
            {content}
          </span>
        ),
        priority: 10,
      },
      // Keyboard key with [[text]]
      {
        pattern: /\[\[(.*?)\]\]/g,
        replacement: (match, content, index) => (
          <kbd
            key={`kbd-${index}`}
            className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-sm font-mono shadow-sm"
          >
            {content}
          </kbd>
        ),
        priority: 11,
      },
      // Links with [text](url) - simple markdown links
      {
        pattern: /\[([^\]]+)\]\(([^)]+)\)/g,
        replacement: (match, content, index) => {
          const parts = match.match(/\[([^\]]+)\]\(([^)]+)\)/);
          if (parts) {
            return (
              <a
                key={`link-${index}`}
                href={parts[2]}
                className="text-[var(--accent)] hover:text-[var(--accent)] underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {parts[1]}
              </a>
            );
          }
          return match;
        },
        priority: 12,
      },
    ];

    // Sort rules by priority to ensure correct processing order
    const sortedRules = [...formatRules].sort(
      (a, b) => (a.priority || 0) - (b.priority || 0)
    );

    // Process text through all formatting rules
    let elements: (string | ReactNode)[] = [text];

    sortedRules.forEach((rule) => {
      elements = elements.flatMap((element, elemIndex) => {
        if (typeof element !== "string") {
          return element;
        }

        const parts: (string | ReactNode)[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        rule.pattern.lastIndex = 0; // Reset regex

        while ((match = rule.pattern.exec(element)) !== null) {
          // Add text before match
          if (match.index > lastIndex) {
            parts.push(element.slice(lastIndex, match.index));
          }

          // Add formatted element
          parts.push(
            rule.replacement(match[0], match[1], `${elemIndex}-${match.index}`)
          );

          lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < element.length) {
          parts.push(element.slice(lastIndex));
        }

        return parts.length > 0 ? parts : element;
      });
    });

    return elements;
  };

  return (
    <div className={`text-formatter ${className}`}>
      <span className="inline-block">
        {formatText(displayText)}
        {shouldTruncate && (
          <>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[var(--accent)] hover:text-[var(--accent)] underline text-sm font-medium transition-colors duration-200 ml-1 inline"
            >
              See more
            </button>
          </>
        )}
        {showSeeMore && children.length > characterLimit && isExpanded && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[var(--accent)] hover:text-[var(--accent)] underline text-sm font-medium transition-colors duration-200 ml-2 inline"
          >
            See less
          </button>
        )}
      </span>
    </div>
  );
};

// Spoiler component that reveals text on hover/click
const SpoilerText: React.FC<SpoilerTextProps> = ({ content }) => {
  const [revealed, setRevealed] = useState<boolean>(false);

  return (
    <span
      className={`cursor-pointer transition-all duration-200 px-1 rounded ${
        revealed
          ? "bg-gray-200 text-black"
          : "bg-black text-black hover:bg-gray-800"
      }`}
      onClick={() => setRevealed(!revealed)}
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
      title="Click or hover to reveal spoiler"
    >
      {content}
    </span>
  );
};

// Demo component to showcase the formatter
export const TextFormatterDemo: React.FC = () => {
  const examples: string[] = [
    "This is **bold text** and this is __also bold__",
    "This is *italic* and this is _also italic_",
    "This is ~~strikethrough~~ text",
    "This is ~underlined~ text",
    "This is `inline code` formatting",
    "This is ==highlighted== text",
    "This is ^superscript^ and this is _{subscript}_",
    "This is --small text-- and this is ++large text++",
    "This is ||spoiler text|| - hover to reveal",
    "This shows {+additions+} and {-deletions-}",
    "This is $mathematical expression$ formatting",
    "Press [[Ctrl+C]] to copy",
    "Links work too: [Google](https://google.com)",
    "**Bold** with *italic* and `code` and ==highlight== combined!",
    // Long text example for see more demo
    `This is a very long text example that demonstrates the "see more" functionality of the TextFormatter component. It contains multiple sentences with various formatting options like **bold text**, *italic text*, \`code formatting\`, ==highlighted text==, and much more content that will trigger the character limit. The component will automatically truncate this text and show a "See more" button when the character limit is reached. Users can click the button to expand the full text or collapse it back to the truncated version. This feature is particularly useful for long content that might overwhelm the user interface when displayed in full.`,
    // Multi-line examples with bullets
    `Here's a bullet list with lots of content that will definitely exceed the character limit:
• First item with **bold** text and additional content to make it longer
- Second item with *italic* text and even more content to demonstrate truncation  
* Third item with \`code\` and extensive explanations about various features
+ Fourth item with ==highlighted== text and detailed descriptions
→ Arrow bullet with ~~strikethrough~~ and comprehensive information
✓ Checkmark bullet completed with thorough documentation
✗ Cross bullet failed with extensive error messages and debugging info
1. Numbered item one with detailed explanations and examples
2. Numbered item **two** with formatting and comprehensive feature descriptions`,
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">
          {`TextFormatter with "See More" Feature`}
        </h1>
        <p className="text-gray-600 mb-6">
          {`A React TypeScript component that formats text and includes a "See more" 
          feature to handle long content gracefully.`}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">New Props</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm space-y-2">
            <div>
              <strong>characterLimit:</strong> number (default: 200) - Sets the
              character limit before truncation
            </div>
            <div>
              <strong>showSeeMore:</strong> boolean (default: true) -
              Enables/disables the see more functionality
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          Examples with Different Limits
        </h2>
        <div className="space-y-6">
          <div className="border-l-4 border-blue-200 pl-4">
            <h3 className="font-medium mb-2">Short limit (50 characters):</h3>
            <TextFormatter characterLimit={50}>
              This is a longer text that will be truncated at 50 characters to
              demonstrate the see more functionality working with different
              limits.
            </TextFormatter>
          </div>

          <div className="border-l-4 border-green-200 pl-4">
            <h3 className="font-medium mb-2">Medium limit (100 characters):</h3>
            <TextFormatter characterLimit={100}>
              This is an even longer piece of text with **bold formatting**,
              *italic text*, and `code blocks` that will be truncated at 100
              characters to show how the formatting is preserved even when
              truncated.
            </TextFormatter>
          </div>

          <div className="border-l-4 border-purple-200 pl-4">
            <h3 className="font-medium mb-2">
              Default limit (200 characters):
            </h3>
            <TextFormatter>{examples[4]}</TextFormatter>
          </div>

          <div className="border-l-4 border-red-200 pl-4">
            <h3 className="font-medium mb-2">See more disabled:</h3>
            <TextFormatter showSeeMore={false}>
              This text has the see more feature disabled, so it will display in
              full regardless of length. This is useful when you want to show
              all content without truncation functionality.
            </TextFormatter>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">All Original Examples</h2>
        <div className="space-y-6">
          {examples.map((example, index) => (
            <div key={index} className="border-l-4 border-blue-200 pl-4">
              <div className="text-sm text-gray-500 font-mono mb-2 whitespace-pre-wrap">
                Input:{" "}
                {example.length > 100
                  ? example.substring(0, 100) + "..."
                  : example}
              </div>
              <div className="text-base border-t pt-2">
                <strong>Output:</strong>
                <div className="mt-2">
                  <TextFormatter characterLimit={200}>{example}</TextFormatter>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Try It Yourself</h2>
        <TestArea />
      </div>
    </div>
  );
};

// Interactive test area
const TestArea = () => {
  const [input, setInput] =
    useState<string>(`Try typing with bullets and formatting - this text is long enough to trigger the see more functionality:

• **Bold** bullet point with additional content to make it longer
- *Italic* bullet point with extensive descriptions and examples  
* \`Code\` bullet point with comprehensive explanations
+ ==Highlighted== bullet point with detailed information
→ ~~Strikethrough~~ with arrow and thorough documentation
✓ Completed task with extensive notes and follow-up actions
1. First numbered item with detailed explanations
2. Second **formatted** item with comprehensive examples

Regular paragraph with **bold** and *italic* text that continues for quite a while to demonstrate how the see more functionality works with mixed content types and various formatting options.

▶ Special formatting: ^superscript^ and _{subscript}_ with additional content
◊ Links work too: [Google](https://google.com) with more text to exceed limits

This component now intelligently handles long content by providing a smooth user experience with the see more/see less toggle functionality.`);

  const [characterLimit, setCharacterLimit] = useState<number>(200);
  const [showSeeMore, setShowSeeMore] = useState<boolean>(true);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Character Limit:
          </label>
          <input
            type="number"
            value={characterLimit}
            onChange={(e) => setCharacterLimit(Number(e.target.value))}
            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            min="10"
            max="1000"
          />
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showSeeMore}
              onChange={(e) => setShowSeeMore(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm font-medium">Enable See More</span>
          </label>
        </div>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        rows={12}
        placeholder="Type your text with formatting symbols and bullets..."
      />
      <div className="p-4 bg-gray-50 rounded-lg border">
        <strong>Formatted Output:</strong>
        <div className="mt-2 bg-white p-3 rounded border">
          <TextFormatter
            characterLimit={characterLimit}
            showSeeMore={showSeeMore}
          >
            {input}
          </TextFormatter>
        </div>
      </div>
    </div>
  );
};

export default TextFormatter;
