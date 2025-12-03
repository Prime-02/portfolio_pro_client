import { ReactNode, RefObject, useRef } from "react";
import { getColorShade } from "../utilities/syncFunctions/syncs";
import { useTheme } from "../theme/ThemeContext ";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline,
  Code,
  Highlighter,
  Superscript,
  Subscript,
  Minus,
  Plus,
  EyeOff,
  List,
  ListOrdered,
  Link,
} from "lucide-react";

interface TextAreaProps {
  ref?: RefObject<HTMLTextAreaElement | null>;
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
  labelStyle?: string;
  labelBgHex?: string;
  labelBgHexIntensity?: number;
  maxLength?: number;
  showLimit?: boolean;
  desc?: string | Element;
  loading?: boolean;
  required?: boolean;
  disabled?: boolean;
  showFormatPanel?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  ref,
  label,
  value,
  onChange,
  className,
  id,
  labelStyle,
  labelBgHex,
  labelBgHexIntensity = 10,
  maxLength = 500,
  showLimit = true,
  desc,
  loading = false,
  required = false,
  disabled = false,
  showFormatPanel = false,
}) => {
  const { theme } = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (
    before: string,
    after: string = before,
    placeholder: string = "text"
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value || "";
    const selectedText = text.substring(start, end);

    const newText =
      text.substring(0, start) +
      before +
      (selectedText || placeholder) +
      after +
      text.substring(end);

    onChange(newText);

    setTimeout(() => {
      if (selectedText) {
        textarea.setSelectionRange(start + before.length, end + before.length);
      } else {
        textarea.setSelectionRange(
          start + before.length,
          start + before.length + placeholder.length
        );
      }
      textarea.focus();
    }, 0);
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const currentText = value || "";

    const needsNewLine = start > 0 && currentText[start - 1] !== "\n";
    const textToInsert = needsNewLine ? "\n" + text : text;

    const newText =
      currentText.substring(0, start) +
      textToInsert +
      currentText.substring(start);

    onChange(newText);

    setTimeout(() => {
      textarea.setSelectionRange(
        start + textToInsert.length,
        start + textToInsert.length
      );
      textarea.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = value || "";

      const newText = text.substring(0, start) + "\n" + text.substring(end);
      onChange(newText);

      setTimeout(() => {
        textarea.setSelectionRange(start + 1, start + 1);
        textarea.focus();
      }, 0);
    }
  };

  const formatButtons = [
    {
      icon: <Bold size={14} />,
      label: "Bold",
      syntax: "**text**",
      action: () => insertFormatting("**", "**"),
    },
    {
      icon: <Italic size={14} />,
      label: "Italic",
      syntax: "*text*",
      action: () => insertFormatting("*", "*"),
    },
    {
      icon: <Strikethrough size={14} />,
      label: "Strikethrough",
      syntax: "~~text~~",
      action: () => insertFormatting("~~", "~~"),
    },
    {
      icon: <Underline size={14} />,
      label: "Underline",
      syntax: "~text~",
      action: () => insertFormatting("~", "~"),
    },
    {
      icon: <Code size={14} />,
      label: "Code",
      syntax: "`text`",
      action: () => insertFormatting("`", "`"),
    },
    {
      icon: <Highlighter size={14} />,
      label: "Highlight",
      syntax: "==text==",
      action: () => insertFormatting("==", "=="),
    },
    {
      icon: <Superscript size={14} />,
      label: "Superscript",
      syntax: "^text^",
      action: () => insertFormatting("^", "^"),
    },
    {
      icon: <Subscript size={14} />,
      label: "Subscript",
      syntax: "_{text}_",
      action: () => insertFormatting("_{", "}_"),
    },
    {
      icon: <Minus size={14} />,
      label: "Small",
      syntax: "--text--",
      action: () => insertFormatting("--", "--"),
    },
    {
      icon: <Plus size={14} />,
      label: "Large",
      syntax: "++text++",
      action: () => insertFormatting("++", "++"),
    },
    {
      icon: <EyeOff size={14} />,
      label: "Spoiler",
      syntax: "||text||",
      action: () => insertFormatting("||", "||", "spoiler"),
    },
  ];

  const listButtons = [
    {
      icon: <List size={14} />,
      label: "Bullet",
      syntax: "• ",
      action: () => insertAtCursor("• "),
    },
    {
      icon: <ListOrdered size={14} />,
      label: "Numbered",
      syntax: "1. ",
      action: () => insertAtCursor("1. "),
    },
  ];

  const specialButtons = [
    {
      icon: <Link size={14} />,
      label: "Link",
      syntax: "[text](url)",
      action: () => insertFormatting("[", "](url)", "link text"),
    },
  ];

  return (
    <>
      <div className="relative h-full">
        {loading ? (
          <div
            className={`${className} rounded-2xl block px-2.5 pb-2.5 pt-4 w-full h-24 text-sm bg-gray-200 dark:bg-gray-700 animate-pulse border-1 border-gray-600`}
          />
        ) : (
          <>
            <textarea
              ref={ref || textareaRef}
              maxLength={maxLength}
              value={value}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onChange(e.target.value)
              }
              onKeyDown={handleKeyDown}
              disabled={disabled}
              rows={
                value && value?.split("\n").length > 1
                  ? value.split("\n").length
                  : 1
              }
              id={id}
              className={`${className} rounded-2xl block px-2.5 pb-2.5 pt-4 w-full text-sm bg-transparent border-1 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-[var(--accent)] focus:outline-none focus:ring-0 focus:border-[var(--accent)] peer`}
              placeholder=" "
              required={required}
            ></textarea>
            <label
              htmlFor={id}
              className={`absolute text-sm dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:px-2 peer-focus:text-[var(--accent)] peer-focus:dark:text-[var(--accent)] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${
                labelStyle ? labelStyle : `card`
              }`}
              style={{
                backgroundColor:
                  (labelBgHex || theme.background) && labelBgHexIntensity
                    ? getColorShade(
                        labelBgHex || theme.background,
                        labelBgHexIntensity
                      )
                    : "none",
              }}
            >
              {label}
            </label>
            {showLimit && (
              <span
                className={`absolute z-10 bg-[var(--background)] bottom-4.5 right-4 font-thin text-xs ${
                  value?.length === maxLength
                    ? "text-red-500"
                    : "px-1 rounded-sm "
                } `}
              >
                {value?.length}/{maxLength}
              </span>
            )}
          </>
        )}
      </div>
      <p className="text-xs opacity-80">{desc as ReactNode}</p>

      {showFormatPanel && (
        <div className="mt-1 rounded-lg p-1.5">
          <div className="flex flex-wrap items-center justify-evenly gap-0.5">
            {/* Text Formatting Buttons */}
            {formatButtons.map((button, index) => (
              <button
                key={`format-${index}`}
                type="button"
                onClick={button.action}
                className="transition-colors hover:text-[var(--accent)]"
                title={`${button.label} - ${button.syntax}`}
              >
                {button.icon}
              </button>
            ))}

            {/* Divider */}
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-0.5" />

            {/* List Buttons */}
            {listButtons.map((button, index) => (
              <button
                key={`list-${index}`}
                type="button"
                onClick={button.action}
                className="transition-colors hover:text-[var(--accent)]"
                title={`${button.label} - ${button.syntax}`}
              >
                {button.icon}
              </button>
            ))}

            {/* Divider */}
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-0.5" />

            {/* Special Buttons */}
            {specialButtons.map((button, index) => (
              <button
                key={`special-${index}`}
                type="button"
                onClick={button.action}
                className="transition-colors hover:text-[var(--accent)]"
                title={`${button.label} - ${button.syntax}`}
              >
                {button.icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
