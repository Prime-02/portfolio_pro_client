import React, { useState, useEffect } from "react"
import type { PortfolioResponse, PortfolioUpdate } from "@/portfolio-builder/store/usePortfolioStore"
import Modal from "../containers/modals/Modal"
import { Textinput } from "../inputs/Textinput"
import { TextArea } from "../inputs/TextArea"
import { useTheme } from "../theme/ThemeContext "
import ColorPicker from "../inputs/ColorPicker"

interface EditPortfolioModalProps {
    portfolio: PortfolioResponse | null
    isOpen: boolean
    onClose: () => void
    onSubmit: (id: string, data: PortfolioUpdate) => void
    isLoading: boolean
}

interface PortfolioThemeLayout {
    themeVariant: string
    lightTheme: {
        background: string
        foreground: string
    }
    darkTheme: {
        background: string
        foreground: string
    }
    accent: string
}

const EditPortfolioModal = ({
    portfolio,
    isOpen,
    onClose,
    onSubmit,
    isLoading,
}: EditPortfolioModalProps) => {
    const { themeVariant, lightTheme, darkTheme, accentColor } = useTheme()
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [isPublic, setIsPublic] = useState(true)

    // Portfolio-specific theme settings
    const [portfolioLightBg, setPortfolioLightBg] = useState(lightTheme.background)
    const [portfolioLightFg, setPortfolioLightFg] = useState(lightTheme.foreground)
    const [portfolioDarkBg, setPortfolioDarkBg] = useState(darkTheme.background)
    const [portfolioDarkFg, setPortfolioDarkFg] = useState(darkTheme.foreground)
    const [portfolioAccent, setPortfolioAccent] = useState(accentColor.color)

    // Helper function to safely parse layout
    const parseLayout = (layout: Record<string, unknown> | null): PortfolioThemeLayout | null => {
        if (!layout) return null;

        // First, extract the theme object from layout
        const theme = layout.theme as Record<string, unknown> | undefined;
        if (!theme) return null;

        // Then validate the theme structure
        if (
            typeof theme.themeVariant === 'string' &&
            theme.lightTheme &&
            typeof theme.lightTheme === 'object' &&
            typeof (theme.lightTheme as Record<string, unknown>).background === 'string' &&
            typeof (theme.lightTheme as Record<string, unknown>).foreground === 'string' &&
            theme.darkTheme &&
            typeof theme.darkTheme === 'object' &&
            typeof (theme.darkTheme as Record<string, unknown>).background === 'string' &&
            typeof (theme.darkTheme as Record<string, unknown>).foreground === 'string' &&
            typeof theme.accent === 'string'
        ) {
            return theme as unknown as PortfolioThemeLayout;
        }

        return null;
    }

    useEffect(() => {
        if (portfolio) {
            setName(portfolio.name)
            setDescription(portfolio.description || "")
            setIsPublic(portfolio.is_public)

            // Load existing layout if available
            const layout = parseLayout(portfolio.layout)
            if (layout) {
                setPortfolioLightBg(layout.lightTheme.background)
                setPortfolioLightFg(layout.lightTheme.foreground)
                setPortfolioDarkBg(layout.darkTheme.background)
                setPortfolioDarkFg(layout.darkTheme.foreground)
                setPortfolioAccent(layout.accent)
            } else {
                // Reset to current theme defaults if no valid layout exists
                setPortfolioLightBg(lightTheme.background)
                setPortfolioLightFg(lightTheme.foreground)
                setPortfolioDarkBg(darkTheme.background)
                setPortfolioDarkFg(darkTheme.foreground)
                setPortfolioAccent(accentColor.color)
            }
        }
    }, [portfolio, lightTheme, darkTheme, accentColor])

    const buildLayout = (): Record<string, unknown> => {
        const layout = {
            theme: {
                themeVariant: themeVariant,
                lightTheme: {
                    background: portfolioLightBg,
                    foreground: portfolioLightFg,
                },
                darkTheme: {
                    background: portfolioDarkBg,
                    foreground: portfolioDarkFg,
                },
                accent: portfolioAccent,
            },
        }
        return layout as unknown as Record<string, unknown>
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!portfolio) return

        const updateData: PortfolioUpdate = {
            name: name.trim(),
            description: description.trim() || undefined,
            is_public: isPublic,
            layout: buildLayout(),
        }

        onSubmit(portfolio.id, updateData)
    }

    const resetToCurrentTheme = () => {
        setPortfolioLightBg(lightTheme.background)
        setPortfolioLightFg(lightTheme.foreground)
        setPortfolioDarkBg(darkTheme.background)
        setPortfolioDarkFg(darkTheme.foreground)
        setPortfolioAccent(accentColor.color)
    }

    const resetToPortfolioDefaults = () => {
        if (portfolio?.layout) {
            const layout = parseLayout(portfolio.layout)
            if (layout) {
                setPortfolioLightBg(layout.lightTheme.background)
                setPortfolioLightFg(layout.lightTheme.foreground)
                setPortfolioDarkBg(layout.darkTheme.background)
                setPortfolioDarkFg(layout.darkTheme.foreground)
                setPortfolioAccent(layout.accent)
            }
        }
    }

    return (
        <Modal title="Edit Portfolio" isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                    <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-1.5">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <Textinput
                        type="text"
                        value={name}
                        onChange={(e) => setName(e)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-1.5">
                        Description
                    </label>
                    <TextArea
                        value={description}
                        onChange={(e) => setDescription(e)}
                    />
                </div>

                {/* Theme Customization Section */}
                <div className="border border-[var(--foreground)]/10 rounded-lg p-4 space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-[var(--foreground)] mb-1">
                            Portfolio Theme
                        </h3>
                        <p className="text-xs text-[var(--foreground)]/50">
                            Customize the appearance of your portfolio. Changes will only affect this portfolio.
                        </p>
                    </div>

                    {/* Accent Color */}
                    <div>
                        <h4 className="text-xs font-medium text-[var(--foreground)]/70 mb-2">
                            Accent Color
                        </h4>
                        <div className="flex items-center gap-3">
                            <ColorPicker
                                value={portfolioAccent}
                                onChange={setPortfolioAccent}
                                size="sm"
                            />
                            <div className="flex-1">
                                <div
                                    className="h-8 rounded-md border border-[var(--foreground)]/20"
                                    style={{ backgroundColor: portfolioAccent }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Light Theme */}
                    <div>
                        <h4 className="text-xs font-medium text-[var(--foreground)]/70 mb-2">
                            Light Theme Colors
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-[var(--foreground)]/60 mb-1">
                                    Background
                                </label>
                                <ColorPicker
                                    value={portfolioLightBg}
                                    onChange={setPortfolioLightBg}
                                    size="sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--foreground)]/60 mb-1">
                                    Foreground
                                </label>
                                <ColorPicker
                                    value={portfolioLightFg}
                                    onChange={setPortfolioLightFg}
                                    size="sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dark Theme */}
                    <div>
                        <h4 className="text-xs font-medium text-[var(--foreground)]/70 mb-2">
                            Dark Theme Colors
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-[var(--foreground)]/60 mb-1">
                                    Background
                                </label>
                                <ColorPicker
                                    value={portfolioDarkBg}
                                    onChange={setPortfolioDarkBg}
                                    size="sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--foreground)]/60 mb-1">
                                    Foreground
                                </label>
                                <ColorPicker
                                    value={portfolioDarkFg}
                                    onChange={setPortfolioDarkFg}
                                    size="sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={resetToCurrentTheme}
                            className="text-xs text-[var(--accent)] hover:underline"
                        >
                            Use current theme
                        </button>
                        {portfolio?.layout && (
                            <button
                                type="button"
                                onClick={resetToPortfolioDefaults}
                                className="text-xs text-[var(--accent)] hover:underline"
                            >
                                Reset to saved
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--foreground)]/10">
                    <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">Public Portfolio</p>
                        <p className="text-xs text-[var(--foreground)]/50">
                            Visible to everyone on the platform
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsPublic(!isPublic)}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${isPublic ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"
                            }`}
                    >
                        <span
                            className={`absolute top-1 left-1 w-4 h-4 bg-[var(--background)] rounded-full transition-transform duration-200 ${isPublic ? "translate-x-5" : "translate-x-0"
                                }`}
                        />
                    </button>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-sm font-medium border border-[var(--foreground)]/20 text-[var(--foreground)] rounded-lg hover:bg-[var(--foreground)]/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 text-sm font-medium bg-[var(--accent)] text-[var(--background)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default EditPortfolioModal