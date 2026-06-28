import React, { useState, useEffect } from "react"
import type { PortfolioResponse, PortfolioUpdate } from "@/portfolio-builder/store/usePortfolioStore"
import Modal from "../containers/modals/Modal"
import { Textinput } from "../inputs/Textinput"
import { TextArea } from "../inputs/TextArea"
import { useTheme } from "../theme/ThemeContext "
import PortfolioThemePicker, { type PortfolioThemeValues } from "./PortfolioThemePicker"

interface EditPortfolioModalProps {
    portfolio: PortfolioResponse | null
    isOpen: boolean
    onClose: () => void
    onSubmit: (id: string, data: PortfolioUpdate) => void
    isLoading: boolean
}

interface PortfolioThemeLayout {
    themeVariant: string
    lightTheme: { background: string; foreground: string }
    darkTheme: { background: string; foreground: string }
    accent: string
}

const parseLayout = (layout: Record<string, unknown> | null): PortfolioThemeLayout | null => {
    if (!layout) return null
    const theme = layout.theme as Record<string, unknown> | undefined
    if (!theme) return null

    if (
        typeof theme.themeVariant === "string" &&
        theme.lightTheme && typeof theme.lightTheme === "object" &&
        typeof (theme.lightTheme as Record<string, unknown>).background === "string" &&
        typeof (theme.lightTheme as Record<string, unknown>).foreground === "string" &&
        theme.darkTheme && typeof theme.darkTheme === "object" &&
        typeof (theme.darkTheme as Record<string, unknown>).background === "string" &&
        typeof (theme.darkTheme as Record<string, unknown>).foreground === "string" &&
        typeof theme.accent === "string"
    ) {
        return theme as unknown as PortfolioThemeLayout
    }

    return null
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

    const currentTheme = (): PortfolioThemeValues => ({
        themeVariant,
        lightBg: lightTheme.background,
        lightFg: lightTheme.foreground,
        darkBg: darkTheme.background,
        darkFg: darkTheme.foreground,
        accent: accentColor.color,
    })

    const [theme, setTheme] = useState<PortfolioThemeValues>(currentTheme)

    const savedTheme = (): PortfolioThemeValues | null => {
        if (!portfolio?.layout) return null
        const layout = parseLayout(portfolio.layout)
        if (!layout) return null
        return {
            themeVariant: layout.themeVariant as "light" | "dark" | "system",
            lightBg: layout.lightTheme.background,
            lightFg: layout.lightTheme.foreground,
            darkBg: layout.darkTheme.background,
            darkFg: layout.darkTheme.foreground,
            accent: layout.accent,
        }
    }

    useEffect(() => {
        if (portfolio) {
            setName(portfolio.name)
            setDescription(portfolio.description || "")
            setIsPublic(portfolio.is_public)
            setTheme(savedTheme() ?? currentTheme())
        }
    }, [portfolio, lightTheme, darkTheme, accentColor])

    const handleSubmit = () => {
        if (!portfolio) return

        onSubmit(portfolio.slug, {
            name: name.trim(),
            description: description.trim() || undefined,
            is_public: isPublic,
            layout: {
                ...portfolio.layout,
                theme: {
                    themeVariant: theme.themeVariant,
                    lightTheme: { background: theme.lightBg, foreground: theme.lightFg },
                    darkTheme: { background: theme.darkBg, foreground: theme.darkFg },
                    accent: theme.accent,
                },
            },
        })
    }

    return (
        <Modal title="Edit Portfolio" isOpen={isOpen} onClose={onClose}>
            <div className="space-y-4 mt-4">
                <div>
                    <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-1.5">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <Textinput type="text" value={name} onChange={(e) => setName(e)} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-1.5">
                        Description
                    </label>
                    <TextArea value={description} onChange={(e) => setDescription(e)} />
                </div>

                <PortfolioThemePicker
                    values={theme}
                    onChange={setTheme}
                    onResetToCurrent={() => setTheme(currentTheme())}
                    onResetToSaved={portfolio?.layout ? () => setTheme(savedTheme() ?? currentTheme()) : undefined}
                    description="Customize the appearance of your portfolio. Changes will only affect this portfolio."
                />

                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--foreground)]/10">
                    <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">Public Portfolio</p>
                        <p className="text-xs text-[var(--foreground)]/50">Visible to everyone on the platform</p>
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
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 text-sm font-medium bg-[var(--accent)] text-[var(--background)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default EditPortfolioModal