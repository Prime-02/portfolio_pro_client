import React, { useCallback, useEffect, useState } from 'react'
import { Textinput } from '../../inputs/Textinput'
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
    mode?: 'availability' | 'existence'
}

// ─── Rules ────────────────────────────────────────────────────────────────────

const USERNAME_RULES = [
    {
        id: 'length',
        label: '3–30 characters',
        test: (v: string) => v.length >= 3 && v.length <= 30,
    },
    {
        id: 'chars',
        label: 'Letters, numbers, underscores ( _ ), hyphens ( - ), or periods ( . ) only',
        test: (v: string) => /^[a-zA-Z0-9._-]+$/.test(v),
    },
    {
        id: 'noConsecutiveDots',
        label: 'No consecutive periods ( .. )',
        test: (v: string) => !(/\.\./).test(v),
    },
    {
        id: 'startEnd',
        label: 'Must start and end with a letter or number',
        test: (v: string) => /^[a-zA-Z0-9]/.test(v) && /[a-zA-Z0-9]$/.test(v),
    },
    {
        id: 'hasNumberOrSymbol',
        label: 'Must contain at least one number or symbol ( 0–9, _, -, . )',
        test: (v: string) => /[0-9._-]/.test(v),
    },
]

export function validateUsername(username: string): { valid: boolean; message?: string } {
    for (const rule of USERNAME_RULES) {
        if (!rule.test(username)) {
            return { valid: false, message: rule.label }
        }
    }
    return { valid: true }
}

// ─── Rules checklist UI ───────────────────────────────────────────────────────

const RulesChecklist = ({ value }: { value: string }) => {
    if (!value) return null

    return (
        <ul className="mt-2 flex flex-col gap-1">
            {USERNAME_RULES.map((rule) => {
                const passed = rule.test(value)
                return (
                    <li
                        key={rule.id}
                        className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${passed
                                ? 'text-green-500'
                                : 'text-[var(--foreground)] opacity-50'
                            }`}
                    >
                        <span className="shrink-0 text-[10px]">
                            {passed ? '✓' : '○'}
                        </span>
                        {rule.label}
                    </li>
                )
            })}
        </ul>
    )
}

// ─── Component ────────────────────────────────────────────────────────────────

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
    mode = 'availability',
}: UsernameFieldProps) => {
    const [error, setError] = useState<string>('')
    const [isValid, setIsValid] = useState(false)
    const [showRules, setShowRules] = useState(false)

    const {
        checkUsername,
        clearUsernameCheck,
        usernameCheckResult,
        isCheckingUsername,
        isLoading,
    } = useUserOnboarding()

    // Show rules checklist as soon as user starts typing
    useEffect(() => {
        setShowRules(!!value && value.length > 0)
    }, [value])

    // Handle username check result from store
    useEffect(() => {
        if (usernameCheckResult) {
            if (mode === 'existence') {
                if (usernameCheckResult.can_use) {
                    setError('User not found')
                    setIsValid(false)
                } else {
                    setError('')
                    setIsValid(true)
                }
            } else {
                if (value === currentUsername) {
                    setError('')
                    setIsValid(true)
                } else if (!usernameCheckResult.can_use) {
                    setError('This username is already taken')
                    setIsValid(false)
                } else {
                    setError('')
                    setIsValid(true)
                }
            }
        }
    }, [usernameCheckResult, value, currentUsername, mode])

    // Reset when value matches current username (availability mode)
    useEffect(() => {
        if (mode === 'availability' && value === currentUsername) {
            setError('')
            setIsValid(true)
            clearUsernameCheck()
        }
    }, [value, currentUsername, mode])

    // Clear when empty
    useEffect(() => {
        if (!value || value.length === 0) {
            setError('')
            setIsValid(false)
            clearUsernameCheck()
        }
    }, [value])

    // Notify parent
    useEffect(() => {
        onValidationChange?.(isValid && !error)
    }, [isValid, error, onValidationChange])

    const handleUsernameCheck = useCallback(
        async (username: string) => {
            if (mode === 'availability' && username === currentUsername) {
                setError('')
                setIsValid(true)
                clearUsernameCheck()
                return
            }

            if (!username || username.length < 3) {
                setError('')
                setIsValid(false)
                clearUsernameCheck()
                return
            }

            const validationResult = validateUsername(username)
            if (!validationResult.valid) {
                // Don't set error here — the rules checklist already surfaces this visually
                setIsValid(false)
                return
            }

            try {
                await checkUsername(username)
            } catch (err) {
                console.error('Error checking username:', err)
                setError('Error checking username')
                setIsValid(false)
            }
        },
        [value, checkUsername, clearUsernameCheck, currentUsername, mode]
    )

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (value && value.length >= 3) {
                if (mode === 'availability' && value === currentUsername) {
                    setError('')
                    setIsValid(true)
                    clearUsernameCheck()
                } else {
                    handleUsernameCheck(value)
                }
            } else {
                setError('')
                setIsValid(false)
                clearUsernameCheck()
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [value, handleUsernameCheck, currentUsername, mode])

    const getHelperText = () => {
        if (isCheckingUsername) return 'Checking username...'
        if (mode === 'existence') {
            if (isValid && !error) return '✓ User found'
            if (!value || value.length < 3) return 'Enter username to search'
            return label || 'Checking if user exists...'
        }
        if (isValid && !error && value) return '✓ Username available'
        if (value === currentUsername) return 'This is your current username'
        if (!value || value.length < 3) return label || 'Choose a username'
        return label || 'Checking availability...'
    }

    // Only show the taken/server error, not format errors (checklist handles those)
    const displayError = error === 'This username is already taken' || error === 'User not found' || error === 'Error checking username'
        ? error
        : ''

    return (
        <div>
            <Textinput
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                prefix={prefix}
                label={getHelperText()}
                error={displayError}
                loading={isLoading || loading}
                type="text"
            />
            {mode === 'availability' && <RulesChecklist value={value} />}
        </div>
    )
}