import { Eye, EyeClosed } from "lucide-react";
import React, { useState, useRef, useEffect, RefObject } from "react";
import Dropdown from "./DynamicDropdown";
import PhoneInputComponent from "./PhoneInput";
import { getColorShade } from "../utilities/syncFunctions/syncs";

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
  labelBgHex?: string;
  labelBgHexIntensity?: number;
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
  autoComplete = "",
  inputMode = "text",
  labelBgHex,
  labelBgHexIntensity,
  onClick = () => {},
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
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
    if (type === "dropdown") {
      return (
        <Dropdown
          type={type}
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
        maxLength={maxLength}
        autoComplete={autoComplete}
        inputMode={inputMode}
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
        id={id}
        className={`${className} block px-2.5 pb-2.5 pt-4 w-full text-sm bg-transparent border-1 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-[var(--accent)] focus:outline-none focus:ring-0 focus:border-[var(--accent)] peer rounded-full text-center`}
        placeholder=" "
      />
    );
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {renderInput()}

      {type !== "dropdown" && type !== "phone" && (
        <label
          htmlFor={id}
          className={`absolute text-sm dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 origin-[0] px-2 peer-focus:px-2 peer-focus:text-[var(--accent)] peer-focus:dark:text-[var(--accent)] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${labelStyle}`}
          style={{
            backgroundColor:
              labelBgHex && labelBgHexIntensity
                ? getColorShade(labelBgHex, labelBgHexIntensity)
                : "none",
          }}
        >
          {label}
        </label>
      )}

      {type === "password" && (
        <button
          type="button"
          className="absolute top-2 right-5 cursor-pointer"
          onClick={toggleShowPassword}
          aria-label={passwordVisible ? "Hide password" : "Show password"}
        >
          {passwordVisible ? <Eye /> : <EyeClosed />}
        </button>
      )}

      {desc && showDesc && (
        <div
          ref={descRef}
          className="absolute z-10 w-64 p-3 mt-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
          style={{ bottom: "100%", left: 0 }}
        >
          {desc}
          <div className="absolute w-4 h-4 transform rotate-45 bg-white dark:bg-gray-800 -bottom-1 left-4 border-b border-r border-gray-200 dark:border-gray-600"></div>
        </div>
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
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  value,
  onChange,
  className,
  id,
  labelStyle,
  labelBgHex,
  labelBgHexIntensity,
}) => {
  return (
    <div className="relative h-full">
      <textarea
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onChange(e.target.value)
        }
        id={id}
        className={`${className} rounded-2xl  block px-2.5 pb-2.5 pt-4 w-full text-sm bg-transparent border-1 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-[var(--accent)] focus:outline-none focus:ring-0 focus:border-[var(--accent)] peer`}
        placeholder=" "
        required
      ></textarea>
      <label
        htmlFor={id}
        className={`absolute text-sm dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:px-2 peer-focus:text-[var(--accent)] peer-focus:dark:text-[var(--accent)] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${
          labelStyle ? labelStyle : `card`
        }`}
        style={{
          backgroundColor:
            labelBgHex && labelBgHexIntensity
              ? getColorShade(labelBgHex, labelBgHexIntensity)
              : "none",
        }}
      >
        {label}
      </label>
    </div>
  );
};
