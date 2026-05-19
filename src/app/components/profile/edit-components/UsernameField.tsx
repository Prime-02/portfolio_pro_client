import React, { useCallback, useEffect, useState } from 'react'
import { Textinput } from '../../inputs/Textinput'
import { validateUsername } from '@/lib/utilities/syncFunctions/syncs'
import { useUserOnboarding } from '@/lib/stores/user/useUserOnboarding'

interface UsernameFieldProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    prefix?: string
    label?: string
    loading?: boolean
    onValidationChange?: (isValid: boolean) => void
    onSave?: () => void
    currentUsername?: string
    mode?: 'availability' | 'existence'  // Add mode prop
}

export const UsernameField = ({
    value,
    onChange,
    placeholder,
    prefix,
    label,
    loading,
    onValidationChange,
    onSave,
    currentUsername,
    mode = 'availability'  // Default to checking availability
}: UsernameFieldProps) => {
    const [error, setError] = useState<string>("");
    const {
        checkUsername,
        clearUsernameCheck,
        usernameCheckResult,
        isCheckingUsername,
        isLoading,
    } = useUserOnboarding();
    const [usernameAvailable, setUsernameAvailable] = useState<string>("");
    const [isValid, setIsValid] = useState(false);

    // Handle username check result from store
    useEffect(() => {
        if (usernameCheckResult) {
            if (mode === 'existence') {
                // For existence mode: username must exist (can_use should be false - meaning it's taken)
                if (usernameCheckResult.can_use) {
                    setUsernameAvailable("User not found");
                    setError("User not found");
                    setIsValid(false);
                } else {
                    setUsernameAvailable("");
                    setError("");
                    setIsValid(true);
                }
            } else {
                // For availability mode: username must be available (can_use should be true)
                if (value === currentUsername) {
                    setUsernameAvailable("");
                    setError("");
                    setIsValid(true);
                } else if (!usernameCheckResult.can_use) {
                    setUsernameAvailable("This username is already taken");
                    setError("This username is already taken");
                    setIsValid(false);
                } else {
                    setUsernameAvailable("");
                    setError("");
                    setIsValid(true);
                }
            }
        }
    }, [usernameCheckResult, value, currentUsername, mode]);

    // Reset validation when value matches current username (only for availability mode)
    useEffect(() => {
        if (mode === 'availability' && value === currentUsername) {
            setUsernameAvailable("");
            setError("");
            setIsValid(true);
            clearUsernameCheck();
        }
    }, [value, currentUsername, mode]);

    // Clear validation when value is empty
    useEffect(() => {
        if (!value || value.length === 0) {
            setUsernameAvailable("");
            setError("");
            setIsValid(false);
            clearUsernameCheck();
        }
    }, [value]);

    // Notify parent of validation changes
    useEffect(() => {
        onValidationChange?.(isValid && !error);
    }, [isValid, error, onValidationChange]);

    const handleUsernameCheck = useCallback(
        async (username: string) => {
            // Skip check if it's the user's current username (only in availability mode)
            if (mode === 'availability' && username === currentUsername) {
                setUsernameAvailable("");
                setError("");
                setIsValid(true);
                clearUsernameCheck();
                return;
            }

            if (!username || username.length < 3) {
                setUsernameAvailable("");
                setError("");
                setIsValid(false);
                clearUsernameCheck();
                return;
            }

            const validationResult = validateUsername(username);
            if (!validationResult.valid) {
                const message = validationResult.message || "Invalid username format";
                setUsernameAvailable(message);
                setError(message);
                setIsValid(false);
                return;
            }

            try {
                await checkUsername(username);
            } catch (error) {
                console.error("Error checking username:", error);
                setUsernameAvailable("Error checking username");
                setError("Error checking username");
                setIsValid(false);
            }
        },
        [value, checkUsername, clearUsernameCheck, currentUsername, mode]
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (value && value.length >= 3) {
                if (mode === 'availability' && value === currentUsername) {
                    setUsernameAvailable("");
                    setError("");
                    setIsValid(true);
                    clearUsernameCheck();
                } else {
                    handleUsernameCheck(value);
                }
            } else {
                setUsernameAvailable("");
                setError("");
                setIsValid(false);
                clearUsernameCheck();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [value, handleUsernameCheck, currentUsername, mode]);

    // Dynamic helper text based on mode
    const getHelperText = () => {
        if (isCheckingUsername) return "Checking username...";
        if (mode === 'existence') {
            if (isValid && !error) return "✓ User found";
            if (!value || value.length < 3) return "Enter username to add";
            return label || "Checking if user exists...";
        }
        if (mode === 'availability') {
            if (isValid && !error && value) return "✓ Username available";
            if (value === currentUsername) return "This is your current username";
            if (!value || value.length < 3) return "Choose a username";
            return label || "Checking availability...";
        }
        return label;
    };

    return (
        <Textinput
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            prefix={prefix}
            label={getHelperText()}
            error={error || usernameAvailable}
            loading={isLoading || loading}
            type="text"
            // success={isValid && !error && value.length >= 3}
        />
    )
}