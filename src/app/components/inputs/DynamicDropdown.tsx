import { ChevronDown, ChevronUp, Search } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Textinput } from "./Textinput";
import { useTheme } from "../theme/ThemeContext ";
import { getColorShade } from "../utilities/syncFunctions/syncs";
import { Theme } from "../types and interfaces/loaderTypes";

interface DropdownOption {
  [key: string]: string | number;
  id: string | number;
  code: string;
}

interface DropdownProps {
  options?: DropdownOption[];
  onSelect: (value: string) => void;
  tag?: string;
  placeholder?: string;
  valueKey?: string;
  displayKey?: string;
  className?: string;
  divClassName?: string;
  emptyMessage?: string;
  onFocus?: () => void;
  type?: string;
  value?: string;
  label?: string;
  disabled?: boolean;
  labelBgHexIntensity?: number;
  includeNoneOption?: boolean;
  includeQueryAsOption?: boolean;
}

interface DropdownMenuProps {
  isOpen: boolean;
  triggerRect: DOMRect | null;
  options: DropdownOption[];
  filteredOptions: DropdownOption[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSelect: (option: DropdownOption) => void;
  theme: Theme;
  type?: string;
  emptyMessage: string;
  valueKey: string;
  placeholder: string;
  displayKey: string;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  labelBgHexIntensity?: number;
  includeNoneOption?: boolean;
  includeQueryAsOption?: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  isOpen,
  triggerRect,
  options,
  filteredOptions,
  searchQuery,
  setSearchQuery,
  handleSelect,
  theme,
  type,
  emptyMessage,
  valueKey,
  displayKey,
  searchInputRef,
  placeholder,
  labelBgHexIntensity = 10,
  includeNoneOption = true,
  includeQueryAsOption = true,
}) => {
  const [position, setPosition] = useState<"top" | "bottom">("bottom");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerRect && menuRef.current) {
      const menuHeight = menuRef.current.offsetHeight || 250;
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }
    }
  }, [isOpen, triggerRect]);

  useEffect(() => {
    if (isOpen && type === "datalist" && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, type, searchInputRef]);

  if (!isOpen || !triggerRect) return null;

  const menuStyle: React.CSSProperties = {
    position: "fixed",
    left: triggerRect.left,
    width: triggerRect.width,
    minWidth: "4rem",
    zIndex: 999999,
    backgroundColor: getColorShade(theme.background, 10),
    ...(position === "top"
      ? { bottom: window.innerHeight - triggerRect.top + 4 }
      : { top: triggerRect.bottom + 4 }),
  };

  // Check if query should be shown as an option
  const shouldShowQueryAsOption =
    includeQueryAsOption &&
    searchQuery.trim() !== "" &&
    !filteredOptions.some(
      (option) =>
        String(option[displayKey]).toLowerCase() === searchQuery.toLowerCase()
    );

  const hasOptions = filteredOptions.length > 0 || shouldShowQueryAsOption;

  return (
    <div
      ref={menuRef}
      className="border border-[var(--accent)] rounded-2xl overflow-auto shadow-lg"
      style={menuStyle}
    >
      {type === "datalist" && (
        <div className="p-2 relative w-full">
          <Search className="mr-2 absolute right-3 top-4.5" />
          <Textinput
            ref={searchInputRef as React.RefObject<HTMLInputElement>}
            type="text"
            label="Search..."
            className="w-full"
            value={searchQuery}
            onChange={setSearchQuery}
            labelBgHexIntensity={labelBgHexIntensity}
          />
        </div>
      )}

      {hasOptions ? (
        <div className="max-h-60 p-2 overflow-y-auto">
          {includeNoneOption && (
            <div
              key="none"
              className="p-2 hover:bg-[var(--accent)] cursor-pointer rounded-lg"
              onClick={() =>
                handleSelect({
                  [valueKey]: "",
                  [displayKey]: `${placeholder}`,
                } as DropdownOption)
              }
            >
              None
            </div>
          )}

          {shouldShowQueryAsOption && (
            <div
              key="query-option"
              className="p-2 hover:bg-[var(--accent)] cursor-pointer rounded-lg border-b border-gray-300 font-medium"
              onClick={() =>
                handleSelect({
                  [valueKey]: searchQuery,
                  [displayKey]: searchQuery,
                } as DropdownOption)
              }
            >
              {`"{searchQuery}" (Create new)`}
            </div>
          )}

          {filteredOptions.map((option) => (
            <div
              key={String(option[valueKey])}
              className="p-2 hover:bg-[var(--accent)] cursor-pointer rounded-lg"
              onClick={() => handleSelect(option)}
            >
              {option[displayKey]}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-2 text-gray-500">
          {options.length === 0 ? emptyMessage : "No matches found"}
        </div>
      )}
    </div>
  );
};

const Dropdown: React.FC<DropdownProps> = ({
  options = [],
  onSelect,
  tag = "item",
  placeholder = "Select an option",
  valueKey = "id",
  displayKey = "code",
  className = "",
  divClassName = "",
  emptyMessage = `No ${tag} available`,
  onFocus = () => {},
  type,
  value,
  label,
  labelBgHexIntensity = 10,
  includeNoneOption = true,
  includeQueryAsOption = true,
  // disabled =false
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [dropdownId] = useState(
    () => `dropdown-${Math.random().toString(36).substr(2, 9)}`
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (value !== undefined && value !== null) {
      if (value === "") {
        setSelectedOption({
          [valueKey]: "",
          [displayKey]: placeholder,
        } as DropdownOption);
      } else {
        const foundOption = options.find(
          (option) => String(option[valueKey]) === String(value)
        );
        if (foundOption) {
          setSelectedOption(foundOption);
        } else {
          // If no option found but we have a value, create a custom option
          setSelectedOption({
            [valueKey]: value,
            [displayKey]: value,
          } as DropdownOption);
        }
      }
    } else {
      setSelectedOption(null);
    }
  }, [value, options, valueKey, displayKey, placeholder]);

  useEffect(() => {
    if (!mounted) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !document
          .querySelector(`[data-dropdown-portal="${dropdownId}"]`)
          ?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownId, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const updateTriggerRect = () => {
      if (dropdownRef.current) {
        setTriggerRect(dropdownRef.current.getBoundingClientRect());
      }
    };

    if (isOpen) {
      updateTriggerRect();

      const handleReposition = () => {
        updateTriggerRect();
      };

      window.addEventListener("scroll", handleReposition, true);
      window.addEventListener("resize", handleReposition);

      return () => {
        window.removeEventListener("scroll", handleReposition, true);
        window.removeEventListener("resize", handleReposition);
      };
    }
  }, [isOpen, mounted]);

  if (!Array.isArray(options)) {
    console.error("Dropdown options must be an array");
    return null;
  }

  const handleSelect = (option: DropdownOption) => {
    setSelectedOption(option);
    setSearchQuery("");
    onSelect(String(option[valueKey]));
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!isOpen && dropdownRef.current) {
      setTriggerRect(dropdownRef.current.getBoundingClientRect());
    }
    setIsOpen(!isOpen);
    if (type !== "datalist") setSearchQuery("");
  };

  const filteredOptions = options.filter((option) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      String(option[valueKey]).toLowerCase().includes(searchLower) ||
      String(option[displayKey]).toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      {type !== "datalist" && <span className=" text-xs">{label}</span>}
      <div
        tabIndex={0}
        onFocus={onFocus}
        className={`${divClassName} min-w-24 peer relative w-full`}
        ref={dropdownRef}
      >
        <div
          className={`${className} flex items-center justify-between p-3 text-sm cursor-pointer rounded-full border border-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent`}
          onClick={handleToggle}
          style={{
            backgroundColor: getColorShade(theme.background, 10),
            borderColor: isOpen ? `var(--accent)` : undefined,
          }}
        >
          <span>
            {selectedOption ? selectedOption[displayKey] : placeholder}
          </span>
          <span>
            {isOpen ? (
              <ChevronUp className="text-[var(--accent)]" />
            ) : (
              <ChevronDown />
            )}
          </span>
        </div>
      </div>

      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div data-dropdown-portal={dropdownId}>
            <DropdownMenu
              placeholder={placeholder}
              isOpen={isOpen}
              triggerRect={triggerRect}
              options={options}
              filteredOptions={filteredOptions}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSelect={handleSelect}
              theme={theme}
              type={type}
              emptyMessage={emptyMessage}
              valueKey={valueKey}
              displayKey={displayKey}
              searchInputRef={searchInputRef}
              labelBgHexIntensity={labelBgHexIntensity}
              includeNoneOption={includeNoneOption}
              includeQueryAsOption={includeQueryAsOption}
            />
          </div>,
          document.body
        )}
    </>
  );
};

export default Dropdown;
