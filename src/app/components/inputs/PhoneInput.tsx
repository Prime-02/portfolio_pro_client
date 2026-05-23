import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface PhoneInputComponentProps {
  phone: string;
  setPhone?: (value: string) => void;
  label?: string;
  onFocus?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const PhoneInputComponent: React.FC<PhoneInputComponentProps> = ({
  phone,
  setPhone,
  label,
  onFocus,
  error,
  disabled,
  required,
  className = "",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = phone && phone.length > 1; // react-phone-input-2 always has the dial code

  return (
    <>
      <style>{`
        #phone-input-wrapper .react-tel-input .form-control {
          width: 100%;
          height: 42px;
          padding-left: 52px;
          padding-right: 12px;
          background: transparent;
          border: 1px solid color-mix(in srgb, var(--foreground) 30%, transparent);
          border-radius: 8px;
          color: var(--foreground);
          font-size: 14px;
          font-family: inherit;
          transition: all 0.2s;
          outline: none;
          box-shadow: none;
        }

        #phone-input-wrapper .react-tel-input .form-control:focus {
          border-color: transparent;
          box-shadow: 0 0 0 2px var(--accent);
        }

        #phone-input-wrapper.has-error .react-tel-input .form-control {
          border-color: rgb(239 68 68);
        }

        #phone-input-wrapper.has-error .react-tel-input .form-control:focus {
          box-shadow: 0 0 0 2px rgb(239 68 68);
        }

        #phone-input-wrapper .react-tel-input .flag-dropdown {
          background: transparent;
          border: none;
          border-right: 1px solid color-mix(in srgb, var(--foreground) 20%, transparent);
          border-radius: 8px 0 0 8px;
          transition: border-color 0.2s;
        }

        #phone-input-wrapper .react-tel-input .flag-dropdown:hover,
        #phone-input-wrapper .react-tel-input .flag-dropdown.open {
          background: transparent;
        }

        #phone-input-wrapper .react-tel-input .selected-flag {
          background: transparent;
          border-radius: 8px 0 0 8px;
          padding: 0 8px 0 10px;
        }

        #phone-input-wrapper .react-tel-input .selected-flag:hover,
        #phone-input-wrapper .react-tel-input .selected-flag:focus {
          background: transparent;
        }

        #phone-input-wrapper .react-tel-input .country-list {
          background: var(--background);
          border: 1px solid color-mix(in srgb, var(--foreground) 20%, transparent);
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          margin-top: 4px;
          color: var(--foreground);
          z-index: 50;
        }

        #phone-input-wrapper .react-tel-input .country-list .country:hover,
        #phone-input-wrapper .react-tel-input .country-list .country.highlight {
          background: color-mix(in srgb, var(--foreground) 8%, transparent);
        }

        #phone-input-wrapper .react-tel-input .country-list .country-name {
          color: var(--foreground);
        }

        #phone-input-wrapper .react-tel-input .country-list .dial-code {
          color: var(--foreground);
          opacity: 0.5;
        }

        #phone-input-wrapper .react-tel-input .country-list .search-box {
          background: var(--background);
          color: var(--foreground);
          border: 1px solid color-mix(in srgb, var(--foreground) 20%, transparent);
          border-radius: 6px;
          width: calc(100% - 16px);
        }

        #phone-input-wrapper .react-tel-input .country-list .search {
          background: var(--background);
          padding: 8px;
          border-bottom: 1px solid color-mix(in srgb, var(--foreground) 10%, transparent);
        }

        #phone-input-wrapper .react-tel-input .arrow {
          border-top-color: var(--foreground);
          opacity: 0.5;
        }

        #phone-input-wrapper .react-tel-input .arrow.up {
          border-bottom-color: var(--foreground);
          border-top-color: transparent;
        }
      `}</style>

      <div
        id="phone-input-wrapper"
        className={`relative ${error ? "has-error" : ""} ${className}`}
      >
        {/* Floating label */}
        {label && (
          <label
            className={`
              absolute z-10 pointer-events-none select-none
              transition-all duration-200
              left-[52px]
              ${isFocused || hasValue
                ? "text-xs -translate-y-2.5 px-1 bg-[var(--background)] text-[var(--accent)] top-0"
                : "text-sm top-[11px] text-[var(--foreground)]"
              }
              ${error ? "text-red-500" : ""}
            `}
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <PhoneInput
          value={phone}
          onChange={setPhone}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          inputClass="!bg-transparent"
          containerClass="!w-full"
          enableSearch
          disableSearchIcon
          placeholder=""
        />
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
      )}
    </>
  );
};

export default PhoneInputComponent;