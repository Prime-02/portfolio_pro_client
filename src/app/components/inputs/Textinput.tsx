import React, { useState, useRef, useEffect, forwardRef } from "react";
import Dropdown from "./DynamicDropdown";
import PhoneInputComponent from "./PhoneInput";
import { Eye, EyeOff, XCircle } from "lucide-react";
import { BsInfoCircle } from "react-icons/bs";

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  label?: string;
  type?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  className?: string;
  labelStyle?: string;
  tag?: string;
  id?: string;
  options?: Array<{ id: string | number; code: string }>;
  desc?: string;
  error?: string;
  loading?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
}

export const Textinput = forwardRef<HTMLInputElement, TextInputProps>(({
  label,
  type = "text",
  value,
  onChange,
  className = "",
  labelStyle = "",
  tag,
  id = "floating_label",
  options,
  desc,
  error,
  loading = false,
  icon,
  disabled,
  required,
  ...inputProps
}, ref) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const localInputRef = useRef<HTMLInputElement>(null);

  const hasValue = value !== undefined && value !== "";
  const isDropdownType = type === "dropdown" || type === "datalist";
  const isPhoneType = type === "phone" || type === "tel";

  // Merge refs callback
  const setRefs = React.useCallback(
    (element: HTMLInputElement | null) => {
      // Update local ref
      (localInputRef as React.MutableRefObject<HTMLInputElement | null>).current = element;
      // Update forwarded ref
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = element;
      }
    },
    [ref]
  );

  // Handle click outside to close description
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDesc(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  // Loading state
  if (loading) {
    return (
      <div className="relative">
        {label && (
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1 ">
            {label}
          </label>
        )}
        <div className="w-full h-10 bg-[var(--foreground)] rounded-lg animate-pulse" />
      </div>
    );
  }

  // Dropdown type
  if (isDropdownType) {
    return (
      <div className="relative">
        <Dropdown
          type={type}
          options={options || []}
          onSelect={(selectedValue: string | string[]) => onChange?.(selectedValue as string)}
          placeholder={label as string}
          tag={tag}
          valueKey="id"
          displayKey="code"
          className={className}
          value={value as string}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  // Phone type
  if (isPhoneType) {
    return (
      <PhoneInputComponent
        label={label}
        phone={value as string}
        setPhone={onChange}
        error={error}
        disabled={disabled}
        required={required}
        className={className}
      />
    );
  }

  // Default input types
  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          {...inputProps}
          ref={setRefs}
          value={value || ""}
          type={
            type === "password"
              ? passwordVisible ? "text" : "password"
              : type
          }
          onChange={type === "date" ? handleDateChange : (e) => onChange?.(e.target.value)}
          onFocus={(e) => {
            setIsFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            inputProps.onBlur?.(e);
          }}
          id={id}
          disabled={disabled}
          required={required}
          className={`
            peer w-full px-3 py-2.5 
            bg-transparent
            border border-[var(--foreground)] border-opacity-30
            rounded-lg
            text-[var(--foreground)]
            placeholder-transparent
            focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${type === 'password' ? 'pr-10' : ''}
            ${icon ? 'pl-10' : ''}
            ${desc ? 'pr-10' : ''}
            ${className}
          `}
          placeholder={(isFocused || hasValue) ? (inputProps.placeholder || label || " ") : " "}
        />

        {/* Floating label */}
        {label && (
          <label
            htmlFor={id}
            className={`
              absolute left-3
              transition-all duration-200 pointer-events-none
              select-none
              ${icon ? 'left-10' : ''}
              ${isFocused || hasValue
                ? `text-xs -translate-y-2.5 px-1
                   bg-[var(--background)] text-[var(--accent)]`
                : 'text-sm top-2.5 text-[var(--foreground)] '
              }
              ${error ? 'text-red-500' : ''}
              ${isFocused && error ? 'text-red-500' : ''}
              ${hasValue && !isFocused && !error ? 'text-[var(--foreground)] ' : ''}
              ${labelStyle}
            `}
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        {/* Left icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)] opacity-50">
            {icon}
          </div>
        )}

        {/* Right side actions */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* Info icon for description */}
          {desc && (
            <button
              type="button"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onClick={() => setShowDesc(!showDesc)}
              className="text-[var(--foreground)] opacity-40 hover:opacity-80 transition-opacity cursor-help"
              tabIndex={-1}
            >
              {
                !showDesc ? <BsInfoCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
              }
            </button>
          )}

          {/* Password toggle */}
          {type === "password" && (
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="text-[var(--foreground)] opacity-50 hover:opacity-80 transition-opacity"
              tabIndex={-1}
            >
              {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Description tooltip */}
      {desc && showDesc && (
        <div
          className="absolute z-10 mt-1 p-3 text-sm rounded-lg shadow-lg border border-[var(--foreground)] border-opacity-20 max-w-xs bg-[var(--background)]"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <p className="text-[var(--foreground)] opacity-90">{desc}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
});

Textinput.displayName = 'Textinput';