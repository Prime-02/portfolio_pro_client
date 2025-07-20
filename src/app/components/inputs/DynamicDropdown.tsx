import { ChevronDown, ChevronUp, Search } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Textinput } from "./Textinput";
import { useTheme } from "../theme/ThemeContext ";
import { getColorShade } from "../utilities/syncFunctions/syncs";

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
}

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
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value !== undefined && value !== null) {
      const foundOption = options.find(
        (option) => String(option[valueKey]) === String(value)
      );
      if (foundOption) {
        setSelectedOption(foundOption);
      } else {
        setSelectedOption(null);
      }
    } else {
      setSelectedOption(null);
    }
  }, [value, options, valueKey]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && type === "datalist" && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, type]);

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

  const filteredOptions = options.filter((option) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      String(option[valueKey]).toLowerCase().includes(searchLower) ||
      String(option[displayKey]).toLowerCase().includes(searchLower)
    );
  });

  return (
    <div
      tabIndex={0}
      onFocus={onFocus}
      className={`${divClassName} min-w-24 peer relative w-full`}
      ref={dropdownRef}
    >
      <div
        className={`${className} flex items-center justify-between p-3 text-sm cursor-pointer rounded-full border border-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (type !== "datalist") setSearchQuery("");
        }}
        style={{
          backgroundColor: getColorShade(theme.background, 10),
          borderColor: isOpen ? `var(--accent)` : undefined,
        }}
      >
        <span>{selectedOption ? selectedOption[displayKey] : placeholder}</span>
        <span>
          {isOpen ? (
            <ChevronUp className="text-[var(--accent)]" />
          ) : (
            <ChevronDown />
          )}
        </span>
      </div>

      {isOpen && (
        <div
          className="absolute border border-[var(--accent)] rounded-2xl w-full min-w-16 overflow-auto mt-1 z-[9999] shadow-lg "
          style={{
            backgroundColor: getColorShade(theme.background, 10),
          }}
        >
          {type === "datalist" && (
            <div className="p-2 relative w-full">
              <Search className="mr-2 h-4 w-4 absolute right-0 top-1/3" />
              <Textinput
                type="text"
                label="Search..."
                className="w-full"
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
          )}

          {filteredOptions.length > 0 ? (
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.map((option) => (
                <div
                  key={String(option[valueKey])}
                  className="p-2 hover:bg-[var(--accent)] cursor-pointer"
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
      )}
    </div>
  );
};

export default Dropdown;
