import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X } from "lucide-react";

export interface DropdownOption {
  [key: string]: string | number;
  id: string | number;
  code: string;
}

interface DropdownProps {
  id?: string;
  options?: DropdownOption[];
  onSelect?: (value: string | string[]) => void;
  tag?: string;
  placeholder?: string;
  valueKey?: string;
  displayKey?: string;
  className?: string;
  containerClassName?: string;
  emptyMessage?: string;
  onFocus?: () => void;
  type?: string;
  value?: string | string[] | number | number[];
  label?: string;
  disabled?: boolean;
  includeNoneOption?: boolean;
  includeQueryAsOption?: boolean;
  error?: string;
  required?: boolean;
  loading?: boolean;
  clearable?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "outlined" | "filled";
  multiple?: boolean;
  maxSelections?: number;
  selectAll?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  id = "",
  options = [],
  onSelect,
  tag = "item",
  placeholder = "Select an option",
  valueKey = "id",
  displayKey = "code",
  className = "",
  containerClassName = "",
  emptyMessage = "No options available",
  onFocus = () => { },
  type = "select",
  value,
  disabled = false,
  includeNoneOption = true,
  includeQueryAsOption = true,
  error,
  loading = false,
  clearable = true,
  size = "md",
  variant = "outlined",
  multiple = false,
  maxSelections,
  selectAll = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<DropdownOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [triggerRect, setTriggerRect] = useState<{
    top: number;
    bottom: number;
    left: number;
    width: number;
  } | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [dropdownId] = useState(() => `dropdown-${Math.random().toString(36).substr(2, 9)}`);

  // Size classes
  const sizeClasses = {
    sm: "text-xs py-1.5 px-2",
    md: "text-sm py-2 px-3",
    lg: "text-base py-2.5 px-4",
  };

  // Variant classes using theme variables
  const variantClasses = {
    outlined: "border border-[var(--foreground)] border-opacity-30 bg-transparent",
    filled: "border border-transparent bg-[var(--foreground)] bg-opacity-10",
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize selected option(s) based on value prop
  useEffect(() => {
    if (multiple) {
      if (Array.isArray(value) && value.length > 0) {
        const foundOptions = value
          .map(v => options.find(option => String(option[valueKey]) === String(v)))
          .filter((option): option is DropdownOption => option !== undefined);
        setSelectedOptions(foundOptions);
      } else {
        setSelectedOptions([]);
      }
    } else {
      if (value !== undefined && value !== null && !Array.isArray(value)) {
        if (value === "") {
          setSelectedOption(null);
        } else {
          const foundOption = options.find(
            (option) => String(option[valueKey]) === String(value)
          );
          setSelectedOption(foundOption || {
            [valueKey]: value,
            [displayKey]: value,
          } as DropdownOption);
        }
      } else {
        setSelectedOption(null);
      }
    }
  }, [value, options, valueKey, displayKey, multiple]);

  // Handle click outside
  useEffect(() => {
    if (!mounted) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !document.querySelector(`[data-dropdown-portal="${dropdownId}"]`)?.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownId, mounted]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!mounted || !isOpen) return;

    const updatePosition = () => {
      if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        setTriggerRect((prev) => {
          if (
            prev &&
            prev.top === rect.top &&
            prev.bottom === rect.bottom &&
            prev.left === rect.left &&
            prev.width === rect.width
          ) {
            return prev;
          }
          return { top: rect.top, bottom: rect.bottom, left: rect.left, width: rect.width };
        });
      }
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, mounted]);

  // Focus search input when datalist opens
  useEffect(() => {
    if (isOpen && type === "datalist" && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, type]);

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeElement = listRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex]);

  const filteredOptions = options.filter((option) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      String(option[valueKey]).toLowerCase().includes(searchLower) ||
      String(option[displayKey]).toLowerCase().includes(searchLower)
    );
  });

  const shouldShowQueryAsOption =
    includeQueryAsOption &&
    type === "datalist" &&
    searchQuery.trim() !== "" &&
    !filteredOptions.some(
      (option) =>
        String(option[displayKey]).toLowerCase() === searchQuery.toLowerCase()
    );

  const isOptionSelected = (option: DropdownOption): boolean => {
    if (multiple) {
      return selectedOptions.some(
        (selected) => String(selected[valueKey]) === String(option[valueKey])
      );
    }
    return selectedOption ? String(selectedOption[valueKey]) === String(option[valueKey]) : false;
  };


  const handleSelect = useCallback((option: DropdownOption) => {
    if (multiple) {
      setSelectedOptions(prev => {
        const isSelected = prev.some(
          (selected) => String(selected[valueKey]) === String(option[valueKey])
        );

        let newSelected: DropdownOption[];
        if (isSelected) {
          newSelected = prev.filter(
            (selected) => String(selected[valueKey]) !== String(option[valueKey])
          );
        } else {
          // Check max selections
          if (maxSelections && prev.length >= maxSelections) {
            return prev; // Don't add if max reached
          }
          newSelected = [...prev, option];
        }

        // Schedule the onSelect callback for after the render
        Promise.resolve().then(() => {
          onSelect?.(newSelected.map(opt => String(opt[valueKey])));
        });

        return newSelected;
      });
      // Don't close dropdown on multi-select
      setSearchQuery("");
    } else {
      setSelectedOption(option);
      setSearchQuery("");

      // Schedule the onSelect callback for after the render
      Promise.resolve().then(() => {
        onSelect?.(String(option[valueKey]));
      });

      handleClose();
    }
  }, [onSelect, valueKey, multiple, maxSelections]);


  const handleSelectAll = useCallback(() => {
    if (!multiple) return;

    const allFilteredOptions = filteredOptions.filter(
      option => String(option[valueKey]) !== "" // Exclude "None" option
    );

    const allSelected = allFilteredOptions.every(option =>
      selectedOptions.some(selected => String(selected[valueKey]) === String(option[valueKey]))
    );

    let newSelected: DropdownOption[];
    if (allSelected) {
      // Deselect all
      newSelected = selectedOptions.filter(
        selected => !allFilteredOptions.some(
          option => String(option[valueKey]) === String(selected[valueKey])
        )
      );
    } else {
      // Select all (respect max selections)
      const optionsToAdd = allFilteredOptions.filter(
        option => !selectedOptions.some(
          selected => String(selected[valueKey]) === String(option[valueKey])
        )
      );
      newSelected = [...selectedOptions, ...optionsToAdd];
      if (maxSelections) {
        newSelected = newSelected.slice(0, maxSelections);
      }
    }

    setSelectedOptions(newSelected);

    // Schedule the onSelect callback for after the render
    Promise.resolve().then(() => {
      onSelect?.(newSelected.map(opt => String(opt[valueKey])));
    });
  }, [multiple, filteredOptions, selectedOptions, maxSelections, onSelect, valueKey]);


  const handleClose = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
    if (type !== "datalist") setSearchQuery("");
  }, [type]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      setSelectedOptions([]);
      Promise.resolve().then(() => {
        onSelect?.([]);
      });
    } else {
      setSelectedOption(null);
      Promise.resolve().then(() => {
        onSelect?.("");
      });
    }
    setSearchQuery("");
  };

  const handleRemoveTag = (e: React.MouseEvent, optionToRemove: DropdownOption) => {
    e.stopPropagation();
    const newSelected = selectedOptions.filter(
      (option) => String(option[valueKey]) !== String(optionToRemove[valueKey])
    );
    setSelectedOptions(newSelected);
    Promise.resolve().then(() => {
      onSelect?.(newSelected.map(opt => String(opt[valueKey])));
    });
  };

  const handleToggle = () => {
    if (disabled || loading) return;

    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setTriggerRect({ top: rect.top, bottom: rect.bottom, left: rect.left, width: rect.width });
      onFocus();
    }
    setIsOpen(!isOpen);
    if (!isOpen && type !== "datalist") setSearchQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || loading) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen && activeIndex >= 0) {
          const options = getActiveOptions();
          if (options[activeIndex]) {
            handleSelect(options[activeIndex]);
          }
        } else {
          handleToggle();
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          handleToggle();
        } else {
          setActiveIndex((prev) => {
            const max = getActiveOptions().length - 1;
            return prev < max ? prev + 1 : 0;
          });
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setActiveIndex((prev) => {
            const max = getActiveOptions().length - 1;
            return prev > 0 ? prev - 1 : max;
          });
        }
        break;
      case "Escape":
        e.preventDefault();
        handleClose();
        break;
      case "Tab":
        if (!multiple) {
          handleClose();
        }
        break;
    }
  };

  const getActiveOptions = () => {
    const result = [];
    if (!multiple && includeNoneOption) {
      result.push({
        [valueKey]: "",
        [displayKey]: "None",
      } as DropdownOption);
    }
    if (shouldShowQueryAsOption) {
      result.push({
        [valueKey]: searchQuery,
        [displayKey]: searchQuery,
      } as DropdownOption);
    }
    return [...result, ...filteredOptions];
  };

  // Check if all filtered options are selected (for select all)
  const areAllFilteredSelected = multiple && filteredOptions.length > 0 &&
    filteredOptions.every(option =>
      selectedOptions.some(selected => String(selected[valueKey]) === String(option[valueKey]))
    );

  if (!Array.isArray(options)) {
    console.error("Dropdown options must be an array");
    return null;
  }

  return (
    <div id={id} className={`flex flex-col gap-1 ${containerClassName}`}>
      {/* Trigger Button */}
      <div
        ref={dropdownRef}
        className={`
          relative w-full rounded-lg transition-all py-1 duration-200
          ${variantClasses[variant]}
          ${isOpen ? 'border-[var(--accent)] ring-2 ring-[var(--accent)] ring-opacity-20' : ''}
          ${error ? 'border-red-500 ring-red-500 ring-opacity-20' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${loading ? 'animate-pulse' : ''}
          ${!disabled && !loading ? 'hover:border-[var(--foreground)] hover:border-opacity-50' : ''}
          ${className}
        `}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${dropdownId}-listbox`}
        aria-label={placeholder}
      >
        <div className={`flex items-center justify-between gap-2 ${sizeClasses[size]}`}>
          {/* Selected Value */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="h-4 w-20 bg-[var(--foreground)] bg-opacity-20 rounded animate-pulse" />
            ) : multiple ? (
              selectedOptions.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {selectedOptions.slice(0, 3).map((option) => (
                    <span
                      key={String(option[valueKey])}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs 
                        bg-[var(--accent)] bg-opacity-10 text-[var(--foreground)] 
                        rounded-full border border-[var(--accent)] border-opacity-20"
                    >
                      <span className="truncate max-w-[100px]">
                        {option[displayKey]}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveTag(e, option)}
                        className="p-0.5 rounded-full hover:bg-[var(--accent)] hover:bg-opacity-20 transition-colors"
                        tabIndex={-1}
                        aria-label={`Remove ${option[displayKey]}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {selectedOptions.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs 
                      bg-[var(--background)]/2 bg-opacity-10 text-[var(--foreground)] rounded-full">
                      +{selectedOptions.length - 3} more
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[var(--foreground)] opacity-50 truncate block">
                  {placeholder}
                </span>
              )
            ) : selectedOption ? (
              <span className="text-[var(--foreground)] truncate block">
                {selectedOption[displayKey]}
              </span>
            ) : (
              <span className="text-[var(--foreground)] opacity-50 truncate block">
                {placeholder}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {clearable && (multiple ? selectedOptions.length > 0 : selectedOption) && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 rounded-full hover:bg-[var(--foreground)] hover:bg-opacity-10 transition-colors"
                tabIndex={-1}
                aria-label="Clear selection"
              >
                <X className="w-4 h-4 text-[var(--foreground)] opacity-50 hover:opacity-80" />
              </button>
            )}
            <ChevronDown
              className={`
                w-4 h-4 transition-transform duration-200
                text-[var(--foreground)] opacity-50
                ${isOpen ? 'rotate-180 text-[var(--accent)] opacity-100' : ''}
              `}
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5" role="alert">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Portal Dropdown Menu */}
      {mounted && typeof document !== "undefined" && isOpen && triggerRect && createPortal(
        <DropdownMenu
          dropdownId={dropdownId}
          triggerRect={triggerRect}
          options={filteredOptions}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSelect={handleSelect}
          handleClose={handleClose}
          type={type}
          emptyMessage={emptyMessage}
          valueKey={valueKey}
          displayKey={displayKey}
          searchInputRef={searchInputRef}
          listRef={listRef}
          shouldShowQueryAsOption={shouldShowQueryAsOption}
          includeNoneOption={includeNoneOption}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          placeholder={placeholder}
          tag={tag}
          multiple={multiple}
          isOptionSelected={isOptionSelected}
          selectAll={selectAll}
          handleSelectAll={handleSelectAll}
          areAllSelected={areAllFilteredSelected}
          maxSelections={maxSelections}
          currentSelectionsCount={selectedOptions.length}
          selectedOption={selectedOption}
          selectedOptions={selectedOptions}
        />,
        document.body
      )}
    </div>
  );
};

// Dropdown Menu Component
interface DropdownMenuProps {
  dropdownId: string;
  triggerRect: { top: number; bottom: number; left: number; width: number };
  options: DropdownOption[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSelect: (option: DropdownOption) => void;
  handleClose: () => void;
  type?: string;
  emptyMessage: string;
  valueKey: string;
  displayKey: string;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  listRef: React.RefObject<HTMLDivElement | null>;
  shouldShowQueryAsOption: boolean;
  includeNoneOption: boolean;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  placeholder: string;
  tag: string;
  multiple?: boolean;
  isOptionSelected: (option: DropdownOption) => boolean;
  selectAll?: boolean;
  handleSelectAll: () => void;
  areAllSelected?: boolean;
  maxSelections?: number;
  currentSelectionsCount?: number;
  selectedOption?: DropdownOption | null;
  selectedOptions?: DropdownOption[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  dropdownId,
  triggerRect,
  options,
  searchQuery,
  setSearchQuery,
  handleSelect,
  handleClose,
  type,
  emptyMessage,
  valueKey,
  displayKey,
  searchInputRef,
  listRef,
  shouldShowQueryAsOption,
  includeNoneOption,
  activeIndex,
  setActiveIndex,
  tag,
  multiple = false,
  isOptionSelected,
  selectAll = false,
  handleSelectAll,
  areAllSelected = false,
  maxSelections,
  currentSelectionsCount = 0,
  selectedOption = null,
  selectedOptions: selectedOptionsProp = [],
  placeholder = "Search..."
}) => {
  const [position, setPosition] = useState<"top" | "bottom">("bottom");
  const menuRef = useRef<HTMLDivElement>(null);

  // Scroll the active/selected option into view when the menu first opens
  useEffect(() => {
    if (!listRef.current) return;

    const selectedIndex = allOptions.findIndex((item) => {
      if (multiple) {
        return selectedOptionsProp.some(
          (sel) => String(sel[valueKey]) === String(item.option[valueKey])
        );
      }
      return selectedOption
        ? String(selectedOption[valueKey]) === String(item.option[valueKey])
        : false;
    });

    if (selectedIndex >= 0) {
      setActiveIndex(selectedIndex);
      const el = listRef.current.children[selectedIndex] as HTMLElement | undefined;
      el?.scrollIntoView({ block: "nearest" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (triggerRect && menuRef.current) {
      const menuHeight = menuRef.current.offsetHeight || 300;
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      setPosition(spaceBelow < menuHeight && spaceAbove > menuHeight ? "top" : "bottom");
    }
  }, [triggerRect]);

  const menuStyle: React.CSSProperties = {
    position: "fixed",
    left: `${triggerRect.left}px`,
    width: `${Math.max(triggerRect.width, 200)}px`,
    minWidth: "200px",
    zIndex: 999999,
    ...(position === "top"
      ? { bottom: `${window.innerHeight - triggerRect.top + 8}px` }
      : { top: `${triggerRect.bottom + 8}px` }),
  };

  // Build options list with "None" and query option
  const displayOptions = [];
  let optionIndex = 0;

  if (!multiple && includeNoneOption) {
    displayOptions.push({
      type: "none" as const,
      option: { [valueKey]: "", [displayKey]: "None" } as DropdownOption,
      index: optionIndex++,
    });
  }

  if (shouldShowQueryAsOption) {
    displayOptions.push({
      type: "query" as const,
      option: { [valueKey]: searchQuery, [displayKey]: searchQuery } as DropdownOption,
      index: optionIndex++,
    });
  }

  const regularOptions = options.map((option) => ({
    type: "regular" as const,
    option,
    index: optionIndex++,
  }));

  const allOptions = [...displayOptions, ...regularOptions];
  const hasOptions = allOptions.length > 0;

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(0);
      listRef.current?.focus();
    }
  };

  const isMaxSelectionsReached = maxSelections !== undefined && currentSelectionsCount >= maxSelections;

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className="card border border-[var(--foreground)] border-opacity-20 rounded-xl shadow-2xl overflow-hidden"
      data-dropdown-portal={dropdownId}
      role="listbox"
      id={`${dropdownId}-listbox`}
    >
      {/* Search Input for Datalist */}
      {type === "datalist" && (
        <div className="p-3 border-b border-[var(--foreground)] border-opacity-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)] opacity-50" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveIndex(-1);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder={placeholder}
              className="w-full pl-9 pr-3 py-2 text-sm 
                bg-[var(--background)] bg-opacity-5
                border border-[var(--background)] border-opacity-20 rounded-lg
                text-[var(--foreground)]
                placeholder:text-[var(--foreground)] placeholder:opacity-40
                focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-50 focus:border-[var(--accent)]
                transition-all duration-200"
            />
          </div>
        </div>
      )}

      {/* Select All Option */}
      {multiple && selectAll && options.length > 0 && (
        <div className="px-2 pt-2">
          <button
            onClick={handleSelectAll}
            className="w-full text-left px-3 py-2 rounded-none transition-all duration-150
              text-sm flex items-center gap-2 hover:bg-[var(--background)]/20 hover:bg-opacity-5
              border-b border-[var(--foreground)] border-opacity-10 pb-2"
          >
            <div className={`
              w-4 h-4 rounded border flex items-center justify-center transition-colors
              ${areAllSelected
                ? 'bg-[var(--accent)] border-[var(--accent)]'
                : 'border-[var(--foreground)] border-opacity-30'}
            `}>
              {areAllSelected && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="font-medium">
              {areAllSelected ? 'Deselect All' : 'Select All'}
            </span>
          </button>
        </div>
      )}

      {/* Options List */}
      {hasOptions ? (
        <div
          ref={listRef}
          className="max-h-60 overflow-y-auto p-2 custom-scrollbar"
          tabIndex={-1}
        >
          {allOptions.map((item) => {
            const selected = isOptionSelected(item.option);
            const disabled = multiple && isMaxSelectionsReached && !selected;

            return (
              <button
                key={`${item.type}-${String(item.option[valueKey])}`}
                onClick={() => !disabled && handleSelect(item.option)}
                onMouseEnter={() => !disabled && setActiveIndex(item.index)}
                className={`
                  w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150
                  text-sm flex items-center gap-2
                  ${activeIndex === item.index
                    ? 'bg-[var(--accent)] bg-opacity-10'
                    : 'text-[var(--foreground)] hover:bg-[var(--foreground)] hover:bg-opacity-5'
                  }
                  ${item.type === "none" ? "italic opacity-50" : ""}
                  ${item.type === "query" ? "border-b border-[var(--foreground)] border-opacity-10 font-medium" : ""}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                role="option"
                aria-selected={selected}
              >
                {/* Checkbox for multi-select */}
                {multiple && (
                  <div className={`
                    w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors
                    ${selected
                      ? 'bg-[var(--accent)] border-[var(--accent)]'
                      : 'border-[var(--foreground)] border-opacity-30'}
                  `}>
                    {selected && <Check className="w-3 h-3 text-white" />}
                  </div>
                )}

                {item.type === "query" && (
                  <span className="text-xs bg-[var(--accent)] bg-opacity-10 text-[var(--accent)] px-1.5 py-0.5 rounded">
                    New
                  </span>
                )}
                <span className="truncate flex-1">{item.option[displayKey]}</span>

                {multiple && selected && (
                  <Check className="w-3 h-3 text-[var(--accent)] flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-4 text-center text-sm text-[var(--foreground)] opacity-50">
          {options.length === 0 ? emptyMessage : "No matches found"}
        </div>
      )}

      {/* Footer with selection count */}
      <div className="px-3 py-2 border-t border-[var(--foreground)] border-opacity-10 text-xs text-[var(--foreground)] opacity-50 flex justify-between items-center">
        <span>
          {allOptions.length} {allOptions.length === 1 ? tag : `${tag}s`}
        </span>
        {multiple && currentSelectionsCount > 0 && (
          <span className="text-[var(--accent)]">
            {currentSelectionsCount} selected
            {maxSelections && ` (max ${maxSelections})`}
          </span>
        )}
      </div>
    </div>
  );
};

export default Dropdown;