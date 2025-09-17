import React, {
  useState,
  useRef,
  useEffect,
  RefObject,
  ReactNode,
} from "react";
import Dropdown from "./DynamicDropdown";
import PhoneInputComponent from "./PhoneInput";
import { getColorShade } from "../utilities/syncFunctions/syncs";
import { useTheme } from "../theme/ThemeContext ";
import CheckBox from "./CheckBox";

interface TextInputProps {
  label?: string;
  type?: string;
  value?: string | number;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  labelStyle?: string;
  tag?: string;
  id?: string;
  options?: Array<{ id: string | number; code: string }>;
  desc?: string;
  ref?: RefObject<HTMLInputElement | null>;
  maxLength?: number;
  max?: number;
  minLength?: number;
  min?: number;
  autoComplete?: string;
  inputMode?:
    | "text"
    | "numeric"
    | "tel"
    | "email"
    | "url"
    | "search"
    | "decimal";
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  labelBgHex?: string;
  labelBgHexIntensity?: number;
  error?: string;
  loading?: boolean;
  required?: boolean;
  pattern?: string;
  step?: number;
  icon?: ReactNode;
}

export const Textinput: React.FC<TextInputProps> = ({
  label,
  type = "text",
  value,
  onChange,
  className = "",
  placeholder,
  labelStyle = "card",
  tag,
  id = "floating_label",
  options,
  desc,
  ref,
  maxLength = 100000,
  max = 100000,
  minLength = 3,
  min = 3,
  autoComplete = "",
  inputMode = "text",
  labelBgHex,
  labelBgHexIntensity = 10,
  onClick = () => {},
  onKeyDown = () => {},
  error = "",
  loading = false,
  required = false,
  pattern,
  step,
  icon,
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { theme } = useTheme();
  const [showDesc, setShowDesc] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);

  const toggleShowPassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    onChange(selectedDate);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node) &&
        descRef.current &&
        !descRef.current.contains(event.target as Node)
      ) {
        setShowDesc(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const renderInput = () => {
    if (loading) {
      return (
        <div
          className={`${className} block px-2.5 pb-2.5 pt-4 h-10 w-full text-sm bg-gray-200 dark:bg-gray-700 animate-pulse border-1 border-gray-300 dark:border-gray-600 rounded-full`}
        />
      );
    }

    if (type === "dropdown" || type === "datalist") {
      return (
        <Dropdown
          type={type}
          label={label}
          options={options || []}
          onSelect={(selectedValue: string) => onChange(selectedValue)}
          placeholder={placeholder}
          tag={tag}
          valueKey="id"
          displayKey="code"
          className={labelStyle}
          divClassName={className}
          emptyMessage={`No ${tag} available`}
          value={value as string}
          onFocus={() => desc && setShowDesc(true)}
        />
      );
    }

    if (type === "phone") {
      return (
        <PhoneInputComponent
          label={label || ""}
          phone={value as string}
          setPhone={onChange}
          onFocus={() => desc && setShowDesc(true)}
        />
      );
    }

    return (
      <input
        min={min}
        max={max}
        pattern={pattern}
        required={required}
        maxLength={maxLength}
        minLength={minLength}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onKeyDown={onKeyDown}
        onClick={onClick}
        ref={ref}
        value={value || ""}
        type={
          type === "password"
            ? passwordVisible
              ? "text"
              : "password"
            : type === "date"
              ? "date"
              : type === "phone"
                ? "tel"
                : type
        }
        onChange={
          type === "date"
            ? handleDateChange
            : (e: React.ChangeEvent<HTMLInputElement>) =>
                onChange(e.target.value)
        }
        onFocus={() => desc && setShowDesc(true)}
        id={id || label}
        className={`${className} block px-2.5 pb-2.5 pt-4 w-full text-sm bg-transparent border-1 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-[var(--accent)] focus:outline-none focus:ring-0 focus:border-[var(--accent)] peer rounded-full text-center`}
        placeholder=" "
        step={step}
      />
    );
  };

  return (
    <div className="flex flex-col">
      <div className="relative" ref={wrapperRef}>
        {renderInput()}
        {error && <span className="text-red-500 text-xs">{error}</span>}

        {type !== "dropdown" && type !== "phone" && (
          <label
            htmlFor={id}
            className={`absolute text-sm dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 origin-[0] px-2 peer-focus:px-2 peer-focus:text-[var(--accent)] peer-focus:dark:text-[var(--accent)] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto flex items-center gap-1 start-1 ${labelStyle}`}
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
            <span className="scale-80">{icon}</span>
            <span>{label}</span>
          </label>
        )}
        {desc && showDesc && (
          <div
            ref={descRef}
            className="absolute z-10 w-64 p-3 mt-1 text-sm rounded-lg shadow-lg bg-[var(--background)] border-[var(--accent)] border "
            style={{ bottom: "100%", left: 0 }}
          >
            {desc}
            <div className="absolute w-4 h-4 transform rotate-45  bg-[var(--background)] border-[var(--accent)]  -bottom-1 left-4 border-b border-r "></div>
          </div>
        )}
      </div>
      {type === "password" && !loading && (
        <span className="mt-2 flex">
          <CheckBox
            isChecked={passwordVisible}
            setIsChecked={toggleShowPassword}
            label={`Show ${label}`}
          />
        </span>
      )}
    </div>
  );
};

interface TextAreaProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
  labelStyle?: string;
  labelBgHex?: string;
  labelBgHexIntensity?: number;
  maxLength?: number;
  showLimit?: string;
  desc?: string | Element;
  loading?: boolean;
  required?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
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
}) => {
  const { theme } = useTheme();
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
              maxLength={maxLength}
              value={value}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onChange(e.target.value)
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
    </>
  );
};
