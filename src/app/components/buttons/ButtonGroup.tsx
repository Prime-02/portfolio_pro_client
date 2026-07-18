"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Button, { ButtonProps } from "./Buttons";

type SubAction = {
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    shortcut?: string; // Keyboard shortcut hint
    description?: string; // Additional description
    variant?: "default" | "danger" | "success"; // Visual distinction in dropdown
};

type ButtonGroupProps = {
    actions: SubAction[];
    defaultActionId?: string;
    onActionChange?: (action: SubAction) => void;
    onMainAction?: (action: SubAction) => void; // Called when main button is clicked
    variant?: ButtonProps["variant"];
    size?: ButtonProps["size"];
    customColor?: string;
    colorIntensity?: ButtonProps["colorIntensity"];
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    dropdownPlacement?: "top" | "bottom"; // Only top or bottom placement
    splitButton?: boolean; // If true, shows split button layout
    keepOpenOnSelect?: boolean; // Keep dropdown open after selection
};

const ButtonGroup = ({
    actions,
    defaultActionId,
    onActionChange,
    onMainAction,
    variant = "primary",
    size = "md",
    customColor,
    colorIntensity,
    disabled = false,
    loading = false,
    className = "",
    dropdownPlacement = "bottom",
    splitButton = true,
    keepOpenOnSelect = false,
}: ButtonGroupProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeAction, setActiveAction] = useState<SubAction>(() => {
        return defaultActionId
            ? actions.find((a) => a.id === defaultActionId) || actions[0]
            : actions[0];
    });

    const [focusedIndex, setFocusedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setFocusedIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus management for keyboard navigation
    useEffect(() => {
        if (isOpen && focusedIndex >= 0 && menuItemsRef.current[focusedIndex]) {
            menuItemsRef.current[focusedIndex]?.focus();
        }
    }, [isOpen, focusedIndex]);

    // Keyboard navigation
    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (!isOpen) return;

            const filteredActions = actions.filter((a) => !a.disabled);

            switch (event.key) {
                case "ArrowDown":
                    event.preventDefault();
                    setFocusedIndex((prev) =>
                        prev < filteredActions.length - 1 ? prev + 1 : 0
                    );
                    break;

                case "ArrowUp":
                    event.preventDefault();
                    setFocusedIndex((prev) =>
                        prev > 0 ? prev - 1 : filteredActions.length - 1
                    );
                    break;

                case "Enter":
                case " ":
                    event.preventDefault();
                    if (focusedIndex >= 0 && focusedIndex < filteredActions.length) {
                        const action = filteredActions[focusedIndex];
                        handleActionSelect(action);
                    }
                    break;

                case "Escape":
                    setIsOpen(false);
                    setFocusedIndex(-1);
                    break;

                case "Tab":
                    setIsOpen(false);
                    setFocusedIndex(-1);
                    break;
            }
        },
        [isOpen, actions]
    );

    const handleMainButtonClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            if (activeAction.onClick && !disabled && !loading) {
                activeAction.onClick();
                onMainAction?.(activeAction);
            }
        },
        [activeAction, disabled, loading, onMainAction]
    );

    const handleActionSelect = useCallback(
        (action: SubAction) => {
            setActiveAction(action);
            onActionChange?.(action);

            if (!keepOpenOnSelect) {
                setIsOpen(false);
                setFocusedIndex(-1);
            }
        },
        [onActionChange, keepOpenOnSelect]
    );

    const getDropdownClasses = () => {
        const base = "absolute z-50 w-full bg-[var(--background)] left-0 overflow-hidden ";

        const isBottom = dropdownPlacement === "bottom";

        // Position classes based on placement
        const position = isBottom
            ? "top-full mt-1"
            : "bottom-full mb-1";

        // Drawer-like animation - slide and scale from the button edge
        const state = isOpen
            ? "opacity-100 scale-y-100 translate-y-0"
            : `opacity-0 scale-y-0 ${isBottom ? '-translate-y-2' : 'translate-y-2'}`;

        const transformOrigin = isBottom ? "origin-top" : "origin-bottom";

        return `${base}${position} ${transformOrigin} transition-all duration-300 ease-out ${state}`;
    };

    return (
        <div ref={dropdownRef} className={`relative flex w-full ${className}`}>
            {splitButton ? (
                // Split button layout
                <div className="flex w-full" onKeyDown={handleKeyDown}>
                    <Button
                        onClick={handleMainButtonClick}
                        variant={variant}
                        size={size}
                        customColor={customColor}
                        colorIntensity={colorIntensity}
                        disabled={disabled || activeAction.disabled}
                        loading={loading}
                        className="flex-1 rounded-r-none"
                        icon={activeAction.icon}
                        text={activeAction.label}
                    />
                    <Button
                        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
                        variant={variant}
                        size={size}
                        customColor={customColor}
                        colorIntensity={colorIntensity}
                        disabled={disabled || loading}
                        className="rounded-l-none px-2 shrink-0"
                        icon={
                            <svg
                                className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                                    }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        }
                    />
                </div>
            ) : (
                // Single button with dropdown
                <Button
                    onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
                    variant={variant}
                    size={size}
                    customColor={customColor}
                    colorIntensity={colorIntensity}
                    disabled={disabled || loading}
                    icon={activeAction.icon}
                    className="w-full"
                    text={activeAction.label}
                    icon2={
                        <svg
                            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                                }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    }
                />
            )}

            {/* Dropdown Menu */}
            <div
                className={`
            ${getDropdownClasses()}
            border border-[var(--foreground)]/10 rounded-lg shadow-lg
          `}
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
                aria-hidden={!isOpen}
                inert={!isOpen ? true : undefined}
            >
                {actions.map((action, index) => (
                    <button
                        key={action.id}
                        ref={(el) => {
                            menuItemsRef.current[index] = el;
                        }}
                        onClick={() => handleActionSelect(action)}
                        disabled={action.disabled}
                        className={`
                w-full flex items-center gap-3 px-4 py-3 text-left
                transition-all duration-150 ease-in-out
                ${action.id === activeAction.id
                                ? "bg-[var(--accent)]/10 text-[var(--accent)] font-medium"
                                : action.variant === "danger"
                                    ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    : action.variant === "success"
                                        ? "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                                        : "text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                            }
                ${focusedIndex === index
                                ? "bg-[var(--foreground)]/5 ring-2 ring-[var(--accent)] ring-inset"
                                : ""
                            }
                ${action.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                ${index === 0 ? "rounded-t-lg" : ""}
                ${index === actions.length - 1 ? "rounded-b-lg" : ""}
                group
              `}
                        role="menuitem"
                        tabIndex={-1}
                    >
                        {action.icon && (
                            <span
                                className={`flex-shrink-0 w-5 h-5 ${action.variant === "danger"
                                    ? "text-red-500"
                                    : action.variant === "success"
                                        ? "text-green-500"
                                        : "text-[var(--foreground)]"
                                    }`}
                            >
                                {action.icon}
                            </span>
                        )}

                        <div className="flex-1 min-w-0">
                            <span className="block text-sm font-medium">{action.label}</span>
                            {action.description && (
                                <span className="block text-sm text-[var(--foreground)]/60 mt-1">
                                    {action.description}
                                </span>
                            )}
                        </div>

                        {action.shortcut && (
                            <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-[var(--foreground)]/50 bg-[var(--foreground)]/10 rounded flex-shrink-0">
                                {action.shortcut}
                            </kbd>
                        )}

                        {action.id === activeAction.id && (
                            <svg
                                className="w-4 h-4 text-[var(--accent)] flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ButtonGroup;