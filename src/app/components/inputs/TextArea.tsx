import { ReactNode, forwardRef, useRef, useImperativeHandle } from "react";
import { useTheme } from "../theme/ThemeContext";
import { getColorShade } from "@/lib/utilities/syncFunctions/syncs";

interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  labelStyle?: string;
  labelBgHex?: string;
  labelBgHexIntensity?: number;
  maxLength?: number;
  showLimit?: boolean;
  desc?: string | Element;
  loading?: boolean;
  required?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      value,
      onChange,
      className,
      id,
      labelStyle,
      labelBgHex,
      labelBgHexIntensity = 1,
      maxLength = Infinity,
      showLimit = false,
      desc,
      loading = false,
      required = false,
      disabled = false,
      style,
      placeholder,
      rows,
      ...textareaProps
    },
    forwardedRef,
  ) => {
    const { theme } = useTheme();
    const internalRef = useRef<HTMLTextAreaElement>(null);

    // Merge the forwarded ref with internal ref
    useImperativeHandle(forwardedRef, () => internalRef.current!);

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
                ref={internalRef}
                value={value}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  onChange(e.target.value)
                }
                disabled={disabled}
                id={id}
                rows={rows}
                className={`${className?.startsWith("modText") ? `rounded-2xl block px-2.5 pb-2.5 pt-4 w-full ${className} bg-transparent border-1 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-[var(--accent)] focus:outline-none focus:ring-0 focus:border-[var(--accent)] peer` : ` ${className} rounded-2xl block px-2.5 pb-2.5 pt-4 w-full text-sm bg-transparent border-1 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-[var(--accent)] focus:outline-none focus:ring-0 focus:border-[var(--accent)] peer`} `}
                placeholder={label ? " " : placeholder || ""}
                required={required}
                style={style}
                {...textareaProps}
              />
              <label
                htmlFor={id}
                className={`absolute text-sm dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:px-2 peer-focus:text-[var(--accent)] peer-focus:dark:text-[var(--accent)] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${labelStyle ? labelStyle : `card`
                  }`}
                style={{
                  backgroundColor:
                    (labelBgHex || theme.background) && labelBgHexIntensity
                      ? getColorShade(
                        labelBgHex || theme.background,
                        labelBgHexIntensity,
                      )
                      : "none",
                }}
              >
                {label}
              </label>
              {showLimit && (
                <span
                  className={`absolute z-10 bg-[var(--background)] bottom-4.5 right-4 font-thin text-xs ${value?.length === maxLength
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
      </>
    );
  },
);

TextArea.displayName = "TextArea";