import { ChevronDown, ChevronUp, Search } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Textinput } from "./Textinput";

const Dropdown = ({
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
  value, // Added value prop
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  if (!Array.isArray(options)) {
    console.error("Dropdown options must be an array");
    return null;
  }

  // Add this useEffect to handle the value prop
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
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

  const handleSelect = (option) => {
    setSelectedOption(option);
    setSearchQuery("");
    onSelect(option[valueKey]);
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
      className={`${divClassName} min-w-24 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer relative w-full`}
      ref={dropdownRef}
    >
      {/* Dropdown Trigger */}
      <div
        className={`${className}  flex items-center justify-between p-2 cursor-pointer`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (type !== "datalist") setSearchQuery("");
        }}
      >
        <span>{selectedOption ? selectedOption[displayKey] : placeholder}</span>
        <span>{isOpen ? <ChevronUp /> : <ChevronDown />}</span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 w-full min-w-16 mt-1 card rounded shadow-lg bg-white">
          {type === "datalist" && (
            <div className="p-2 border-b relative w-full">
              <Search className="mr-2 h-4 w-4 absolute right-0 top-1/3" />
              <Textinput
                ref={searchInputRef}
                type="text"
                label="Search..."
                className="w-full border-b"
                value={searchQuery}
                changed={(e) => setSearchQuery(e)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {filteredOptions.length > 0 ? (
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.map((option) => (
                <div
                  key={option[valueKey]}
                  className="p-2 hover:border-b cursor-pointer"
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
