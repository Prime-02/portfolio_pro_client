import { Eye, EyeClosed, ChevronDown, ChevronUp, Search } from "lucide-react";
import React, { 
  useState, 
  useRef, 
  useEffect, 
  forwardRef, 
  InputHTMLAttributes, 
  TextareaHTMLAttributes, 
  ReactNode,
  FocusEvent,
  MouseEvent,
  KeyboardEvent
} from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Define option type for dropdown
interface DropdownOption {
  id: string | number;
  code: string;
  [key: string]: any;
}

// Base input styles enum for better type safety
enum LabelStyle {
  CARD = "card",
  FLOATING = "floating",
  MODERN = "modern",
  MINIMAL = "minimal"
}

// Enhanced variant styles
const getVariantStyles = (variant: string = 'default', status: string = 'default') => {
  const baseStyles = "block px-2.5 pb-2.5 pt-4 w-full text-sm bg-transparent border appearance-none focus:outline-none focus:ring-0 peer transition-all duration-200";
  
  const variantStyles = {
    default: "border-gray-300 dark:border-gray-600",
    outlined: "border-2 border-gray-300 dark:border-gray-600 rounded-lg",
    filled: "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg",
    ghost: "border-transparent bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
  };

  const statusStyles = {
    default: "focus:border-blue-600 dark:focus:border-blue-500",
    error: "border-red-500 focus:border-red-600 dark:border-red-400 dark:focus:border-red-300",
    success: "border-green-500 focus:border-green-600 dark:border-green-400 dark:focus:border-green-300",
    warning: "border-yellow-500 focus:border-yellow-600 dark:border-yellow-400 dark:focus:border-yellow-300"
  };

  return `${baseStyles} ${variantStyles[variant as keyof typeof variantStyles] || variantStyles.default} ${statusStyles[status as keyof typeof statusStyles] || statusStyles.default}`;
};

// Enhanced label styles
const getLabelStyles = (labelStyle: string = LabelStyle.CARD, status: string = 'default', size: string = 'md') => {
  // Common styles
  const commonStyles = "absolute duration-300 rounded-2xl transform origin-[0] px-2";
  
  // Size styles
  const sizeStyles = {
    sm: "text-xs",
    md: "text-sm", 
    lg: "text-base"
  };

  // Status styles
  const statusStyles = {
    default: "text-gray-500 dark:text-gray-400 peer-focus:text-blue-600 peer-focus:dark:text-blue-500",
    error: "text-red-500 dark:text-red-400 peer-focus:text-red-600 peer-focus:dark:text-red-300",
    success: "text-green-500 dark:text-green-400 peer-focus:text-green-600 peer-focus:dark:text-green-300",
    warning: "text-yellow-500 dark:text-yellow-400 peer-focus:text-yellow-600 peer-focus:dark:text-yellow-300"
  };

  // Label style variants
  const labelVariants = {
    [LabelStyle.CARD]: `
      -translate-y-4 scale-75 
      peer-focus:px-2 
      peer-placeholder-shown:scale-100 
      peer-placeholder-shown:-translate-y-1/2 
      peer-placeholder-shown:top-1/2 
      peer-focus:scale-75 
      peer-focus:-translate-y-4 
      rtl:peer-focus:translate-x-1/4 
      rtl:peer-focus:left-auto 
      start-1
      top-2 peer-focus:top-2
    `,
    [LabelStyle.FLOATING]: `
      -translate-y-6 scale-75
      peer-focus:-translate-y-6
      peer-focus:scale-75
      peer-placeholder-shown:translate-y-0
      peer-placeholder-shown:scale-100
      top-3
      peer-focus:top-3
      start-1
      bg-white dark:bg-gray-800
      px-1
    `,
    [LabelStyle.MODERN]: `
      -translate-y-6
      scale-100
      peer-focus:-translate-y-6
      peer-placeholder-shown:translate-y-0
      top-3
      peer-focus:top-3
      start-0
      border-l-4 border-blue-500
      pl-2
    `,
    [LabelStyle.MINIMAL]: `
      -translate-y-6
      scale-100
      peer-focus:-translate-y-6
      peer-placeholder-shown:translate-y-0
      top-3
      peer-focus:top-3
      start-0
      pl-0
      opacity-75
      peer-focus:opacity-100
    `
  };

  return `
    ${commonStyles}
    ${sizeStyles[size as keyof typeof sizeStyles] || sizeStyles.md}
    ${statusStyles[status as keyof typeof statusStyles] || statusStyles.default}
    ${labelVariants[labelStyle as keyof typeof labelVariants] || labelVariants[LabelStyle.CARD]}
  `.replace(/\s+/g, ' ').trim();
};

// Dropdown Props Interface
interface DropdownProps {
  options?: DropdownOption[];
  onSelect?: (value: any) => void;
  tag?: string;
  placeholder?: string;
  valueKey?: string;
  displayKey?: string;
  className?: string;
  divClassName?: string;
  emptyMessage?: string;
  onFocus?: () => void;
  type?: 'default' | 'datalist';
  value?: any;
  searchable?: boolean;
  disabled?: boolean;
  maxHeight?: string;
  loading?: boolean;
  loadingText?: string;
  clearable?: boolean;
  onClear?: () => void;
}

// Enhanced Dropdown Component
const Dropdown: React.FC<DropdownProps> = ({
  options = [],
  onSelect = () => {},
  tag = "item",
  placeholder = "Select an option",
  valueKey = "id",
  displayKey = "code",
  className = "",
  divClassName = "",
  emptyMessage = `No ${tag} available`,
  onFocus = () => {},
  type = 'default',
  value,
  searchable = false,
  disabled = false,
  maxHeight = "max-h-60",
  loading = false,
  loadingText = "Loading...",
  clearable = false,
  onClear = () => {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  if (!Array.isArray(options)) {
    console.error("Dropdown options must be an array");
    return null;
  }

  // Handle value prop changes
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

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && (type === "datalist" || searchable) && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, type, searchable]);

  const handleSelect = (option: DropdownOption) => {
    setSelectedOption(option);
    setSearchQuery("");
    onSelect(option[valueKey]);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOption(null);
    setSearchQuery("");
    onClear();
    onSelect(null);
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (type !== "datalist" && !searchable) setSearchQuery("");
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
      tabIndex={disabled ? -1 : 0}
      onFocus={onFocus}
      className={`${divClassName} min-w-24 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer relative w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      ref={dropdownRef}
    >
      {/* Dropdown Trigger */}
      <div
        className={`${className} flex items-center justify-between p-2 cursor-pointer ${disabled ? 'cursor-not-allowed' : ''}`}
        onClick={handleToggle}
      >
        <span className="flex-1 truncate">
          {selectedOption ? selectedOption[displayKey] : placeholder}
        </span>
        <div className="flex items-center space-x-2">
          {clearable && selectedOption && !disabled && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Clear selection"
            >
              ×
            </button>
          )}
          <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown size={16} />
          </span>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full min-w-16 mt-1 card rounded shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {(type === "datalist" || searchable) && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-700 relative w-full">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-8 pr-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-3xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white "
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {loading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              {loadingText}
            </div>
          ) : filteredOptions.length > 0 ? (
            <div className={`${maxHeight} overflow-y-auto`}>
              {filteredOptions.map((option) => (
                <div
                  key={option[valueKey]}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors duration-150"
                  onClick={() => handleSelect(option)}
                >
                  {option[displayKey]}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              {options.length === 0 ? emptyMessage : "No matches found"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Phone Input Component Props
interface PhoneInputComponentProps {
  phone?: string;
  setPhone?: (phone: string) => void;
  label?: string;
  onFocus?: () => void;
  onChange?: (phone: string) => void;
  value?: string;
  disabled?: boolean;
  placeholder?: string;
  country?: string;
  enableSearch?: boolean;
  disableDropdown?: boolean;
  onlyCountries?: string[];
  excludeCountries?: string[];
  preferredCountries?: string[];
  className?: string;
  containerClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  searchClassName?: string;
  id?: string;
  name?: string;
  required?: boolean;
  autoComplete?: string;
  tabIndex?: number;
  onBlur?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  errorMessage?: string;
  successMessage?: string;
  status?: 'default' | 'error' | 'success' | 'warning';
}

// Enhanced Phone Input Component
const PhoneInputComponent: React.FC<PhoneInputComponentProps> = ({
  phone,
  setPhone,
  label,
  onFocus = () => {},
  onChange,
  value,
  disabled = false,
  placeholder = "Enter phone number",
  country = "us",
  enableSearch = true,
  disableDropdown = false,
  onlyCountries = [],
  excludeCountries = [],
  preferredCountries = [],
  className = "",
  containerClassName = "",
  inputClassName = "",
  buttonClassName = "",
  dropdownClassName = "",
  searchClassName = "",
  id = "phone-input",
  name,
  required = false,
  autoComplete = "tel",
  tabIndex,
  onBlur = () => {},
  onKeyDown = () => {},
  errorMessage,
  successMessage,
  status = 'default'
}) => {
  const phoneValue = phone || value || "";
  
  const handleChange = (phoneNumber: string) => {
    setPhone?.(phoneNumber);
    onChange?.(phoneNumber);
  };

  const getStatusStyles = () => {
    switch (status) {
      case 'error':
        return 'border-red-500 focus:border-red-600';
      case 'success':
        return 'border-green-500 focus:border-green-600';
      case 'warning':
        return 'border-yellow-500 focus:border-yellow-600';
      default:
        return 'border-gray-300 focus:border-blue-600';
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <PhoneInput
          inputProps={{
            id,
            name,
            required,
            autoComplete,
            tabIndex,
            onBlur,
            onKeyDown: onKeyDown as any,
            'aria-invalid': status === 'error',
            'aria-describedby': 
              errorMessage ? `${id}-error` : 
              successMessage ? `${id}-success` : undefined
          }}
          country={country}
          value={phoneValue}
          onChange={handleChange}
          onFocus={onFocus}
          disabled={disabled}
          placeholder={placeholder}
          enableSearch={enableSearch}
          disableDropdown={disableDropdown}
          onlyCountries={onlyCountries.length > 0 ? onlyCountries : undefined}
          excludeCountries={excludeCountries.length > 0 ? excludeCountries : undefined}
          preferredCountries={preferredCountries.length > 0 ? preferredCountries : undefined}
          inputClass={`card !w-full ${getStatusStyles()} ${inputClassName}`}
          containerClass={`!w-full ${containerClassName}`}
          buttonClass={`card ${getStatusStyles()} ${buttonClassName}`}
          dropdownClass={`card ${dropdownClassName}`}
          searchClass={`${searchClassName}`}
        />
      </div>

      {/* Status messages */}
      {errorMessage && (
        <p id={`${id}-error`} className="text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
      
      {successMessage && !errorMessage && (
        <p id={`${id}-success`} className="text-sm text-green-600 dark:text-green-400">
          {successMessage}
        </p>
      )}
    </div>
  );
};

// Base input props interface
interface BaseInputProps {
  label?: string;
  labelStyle?: LabelStyle | string;
  tag?: string;
  desc?: string | ReactNode;
  className?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  errorMessage?: string;
  successMessage?: string;
  showPasswordToggle?: boolean;
  passwordToggleClassName?: string;
  descriptionClassName?: string;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  variant?: 'default' | 'outlined' | 'filled' | 'ghost';
  inputSize?: 'sm' | 'md' | 'lg';
  status?: 'default' | 'error' | 'success' | 'warning';
  placeholder?: string;
  id?: string;
  maxLength?: number;
  autoComplete?: string;
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  onClick?: (event: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyPress?: (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  tabIndex?: number;
  name?: string;
  form?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  pattern?: string;
  accept?: string;
  capture?: boolean | 'user' | 'environment';
  multiple?: boolean;
}

// Dropdown specific props
interface DropdownSpecificProps extends BaseInputProps {
  type: "dropdown";
  options: DropdownOption[];
  valueKey?: string;
  displayKey?: string;
  emptyMessage?: string;
  onSelect?: (value: any) => void;
  value?: any;
  onChange?: (value: any) => void;
  searchable?: boolean;
  clearable?: boolean;
  dropdownType?: 'default' | 'datalist';
  maxHeight?: string;
  loading?: boolean;
}

// Phone input specific props
interface PhoneSpecificProps extends BaseInputProps {
  type: "phone";
  phone?: string;
  setPhone?: (phone: string) => void;
  value?: string;
  onChange?: (value: string) => void;
  country?: string;
  enableSearch?: boolean;
  disableDropdown?: boolean;
  onlyCountries?: string[];
  excludeCountries?: string[];
  preferredCountries?: string[];
}

// Standard input props
interface StandardInputProps extends BaseInputProps, 
  Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'onChange' | 'autoComplete' | 'onBlur' | 'onClick' | 'onFocus' | 'onKeyDown' | 'onKeyUp' | 'onKeyPress'> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'color' | 'range' | 'file' | 'hidden';
  value?: string | number;
  onChange?: (value: string | number) => void;
}

// Union type for all possible input configurations
type TextInputProps = DropdownSpecificProps | PhoneSpecificProps | StandardInputProps;

// TextArea specific props
interface TextAreaProps extends BaseInputProps, 
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'onBlur' | 'onFocus' | 'onKeyDown' | 'onKeyUp' | 'onKeyPress' | 'onClick'> {
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
  cols?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  wrapperStyle?: React.CSSProperties;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({
  label,
  type = "text",
  value,
  onChange,
  className = "",
  wrapperClassName = "",
  labelClassName = "",
  placeholder,
  labelStyle = LabelStyle.CARD,
  tag,
  id = "floating_label",
  desc,
  maxLength = 100000,
  autoComplete = "",
  inputMode,
  onClick,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  onKeyPress,
  errorMessage,
  successMessage,
  showPasswordToggle = true,
  passwordToggleClassName = "",
  descriptionClassName = "",
  isLoading = false,
  leftIcon,
  rightIcon,
  variant = 'default',
  inputSize = 'md',
  status = 'default',
  disabled = false,
  required = false,
  readOnly = false,
  tabIndex,
  name,
  form,
  min,
  max,
  step,
  pattern,
  accept,
  capture,
  multiple,
  ...rest
}, ref) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);

  // Determine current status based on props
  const currentStatus = errorMessage ? 'error' : successMessage ? 'success' : status;

  const toggleShowPassword = () => {
    setPasswordVisible(!passwordVisible);
  };

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (type === 'number') {
    const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
    (onChange as (value: string | number) => void)?.(numValue);
  } else {
    (onChange as (value: string | number) => void)?.(e.target.value);
  }
};

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (desc) setShowDesc(true);
    onFocus?.(e);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
  };

  // Handle clicks outside the description popup
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
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
    // Handle dropdown type
    if (type === "dropdown") {
      const dropdownProps = rest as Partial<DropdownSpecificProps>;
      return (
        <Dropdown
          options={dropdownProps.options || []}
          onSelect={(selectedValue: any) => {
            dropdownProps.onSelect?.(selectedValue);
            onChange?.(selectedValue);
          }}
          placeholder={placeholder}
          tag={tag}
          valueKey={dropdownProps.valueKey || "id"}
          displayKey={dropdownProps.displayKey || "code"}
          className={`card border-gray-300 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 ${className}`}
          divClassName={wrapperClassName}
          emptyMessage={dropdownProps.emptyMessage || `No ${tag} available`}
          value={value}
          onFocus={handleFocus as any}
          type={dropdownProps.dropdownType || 'default'}
          searchable={dropdownProps.searchable}
          clearable={dropdownProps.clearable}
          maxHeight={dropdownProps.maxHeight}
          loading={dropdownProps.loading}
          disabled={disabled}
        />
      );
    }

    // Handle phone type
    if (type === "phone") {
      const phoneProps = rest as Partial<PhoneSpecificProps>;
      return (
        <PhoneInputComponent
          label={label}
          phone={phoneProps.phone || (value as string)}
          setPhone={(phone: string) => {
            phoneProps.setPhone?.(phone);
            onChange?.(phone);
          }}
          onFocus={handleFocus as any}
          disabled={disabled}
          required={required}
          errorMessage={errorMessage}
          successMessage={successMessage}
          status={currentStatus}
          country={phoneProps.country}
          enableSearch={phoneProps.enableSearch}
          disableDropdown={phoneProps.disableDropdown}
          onlyCountries={phoneProps.onlyCountries}
          excludeCountries={phoneProps.excludeCountries}
          preferredCountries={phoneProps.preferredCountries}
          className={className}
          id={id}
          name={name}
          autoComplete={autoComplete}
          tabIndex={tabIndex}
          onBlur={handleBlur as any}
          onKeyDown={handleKeyDown as any}
        />
      );
    }

    // Handle standard input types
    const inputProps = rest as Partial<StandardInputProps>;
    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 z-10 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          {...(inputProps as any)}
          ref={ref}
          value={value || ""}
          type={
            type === "password"
              ? passwordVisible
                ? "text"
                : "password"
              : type
          }
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onKeyUp={onKeyUp}
          onKeyPress={onKeyPress}
          onClick={onClick}
          id={id}
          name={name}
          form={form}
          disabled={disabled || isLoading}
          required={required}
          readOnly={readOnly}
          tabIndex={tabIndex}
          maxLength={maxLength}
          autoComplete={autoComplete}
          inputMode={inputMode}
          min={min}
          max={max}
          step={step}
          pattern={pattern}
          accept={accept}
          multiple={multiple}
          className={`rounded-full text-center ${getVariantStyles(variant, currentStatus)} ${leftIcon ? 'pl-10' : ''} ${rightIcon || (type === 'password' && showPasswordToggle) ? 'pr-10' : ''} ${className}`}
          placeholder=""
        />

        {/* Right side icons */}
        <div className="absolute right-3 flex items-center space-x-2">
          {isLoading && (
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          )}
          
          {type === "password" && showPasswordToggle && (
            <button
              type="button"
              className={`cursor-pointer text-gray-400 hover:text-gray-600  dark:hover:text-gray-300 ${passwordToggleClassName}`}
              onClick={toggleShowPassword}
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {passwordVisible ? <Eye size={16} /> : <EyeClosed size={16} />}
            </button>
          )}
          
          {rightIcon && (
            <div className="text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${wrapperClassName}`} ref={wrapperRef}>
      {renderInput()}

      {/* Label for non-dropdown and non-phone inputs */}
      {type !== "dropdown" && type !== "phone" && label && (
        <label
          htmlFor={id}
          className={`${getLabelStyles(labelStyle, currentStatus, inputSize)} ${labelClassName}`}
        >
          {/* {label}
          {required && <span className="text-red-500 ml-1">*</span>} */}
        </label>
      )}

      {/* Status messages */}
      {errorMessage && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
      
      {successMessage && !errorMessage && (
        <p id={`${id}-success`} className="mt-1 text-sm text-green-600 dark:text-green-400">
          {successMessage}
        </p>
      )}

      {/* Description popup */}
      {desc && showDesc && (
        <div
          ref={descRef}
          id={`${id}-desc`}
          className={`absolute z-50 w-64 p-3 mt-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 ${descriptionClassName}`}
          style={{ bottom: "100%", left: 0 }}
        >
          {desc}
          <div className="absolute w-4 h-4 transform rotate-45 bg-white dark:bg-gray-800 -bottom-1 left-4 border-b border-r border-gray-200 dark:border-gray-600"></div>

                  </div>
      )}
    </div>
  );
});

TextInput.displayName = "TextInput";

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  value,
  onChange,
  className = "",
  wrapperClassName = "",
  labelClassName = "",
  placeholder,
  labelStyle = LabelStyle.CARD,
  tag,
  id = "floating_label",
  desc,
  maxLength = 100000,
  autoComplete = "",
  inputMode,
  onClick,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  onKeyPress,
  errorMessage,
  successMessage,
  descriptionClassName = "",
  isLoading = false,
  leftIcon,
  rightIcon,
  variant = 'default',
  inputSize = 'md',
  status = 'default',
  disabled = false,
  required = false,
  readOnly = false,
  tabIndex,
  name,
  form,
  rows = 3,
  cols,
  resize = 'vertical',
  wrapperStyle,
  ...rest
}, ref) => {
  const [showDesc, setShowDesc] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);

  // Determine current status based on props
  const currentStatus = errorMessage ? 'error' : successMessage ? 'success' : status;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  const handleFocus = (e: FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    if (desc) setShowDesc(true);
    onFocus?.(e);
  };

  const handleBlur = (e: FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(e);
  };

  // Handle clicks outside the description popup
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
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

  return (
    <div className={`relative ${wrapperClassName}`} style={wrapperStyle} ref={wrapperRef}>
      <div className="relative flex items-start">
        {leftIcon && (
          <div className="absolute left-3 top-3 z-10 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <textarea
          {...rest}
          ref={ref}
          value={value || ""}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onKeyUp={onKeyUp}
          onKeyPress={onKeyPress}
          onClick={onClick}
          id={id}
          name={name}
          form={form}
          disabled={disabled || isLoading}
          required={required}
          readOnly={readOnly}
          tabIndex={tabIndex}
          maxLength={maxLength}
          autoComplete={autoComplete}
          inputMode={inputMode}
          rows={rows}
          cols={cols}
          className={`${getVariantStyles(variant, currentStatus)} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className} ${resize === 'none' ? 'resize-none' : resize === 'both' ? 'resize' : resize === 'horizontal' ? 'resize-x' : 'resize-y'}`}
          placeholder=" "
        />

        {rightIcon && (
          <div className="absolute right-3 top-3 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>

      {label && (
        <label
          htmlFor={id}
          className={`${getLabelStyles(labelStyle, currentStatus, inputSize)} ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Status messages */}
      {errorMessage && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
      
      {successMessage && !errorMessage && (
        <p id={`${id}-success`} className="mt-1 text-sm text-green-600 dark:text-green-400">
          {successMessage}
        </p>
      )}

      {/* Description popup */}
      {desc && showDesc && (
        <div
          ref={descRef}
          id={`${id}-desc`}
          className={`absolute z-50 w-64 p-3 mt-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 ${descriptionClassName}`}
          style={{ bottom: "100%", left: 0 }}
        >
          {desc}
          <div className="absolute w-4 h-4 transform rotate-45 bg-white dark:bg-gray-800 -bottom-1 left-4 border-b border-r border-gray-200 dark:border-gray-600"></div>
        </div>
      )}
    </div>
  );
});

TextArea.displayName = "TextArea";

export { LabelStyle };