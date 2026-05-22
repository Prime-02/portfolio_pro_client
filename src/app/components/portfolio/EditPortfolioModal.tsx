import React, { useState, useEffect } from "react"
import type { PortfolioResponse } from "@/portfolio-builder/store/usePortfolioStore"
import Modal from "../containers/modals/Modal"
import { Textinput } from "../inputs/Textinput"
import { TextArea } from "../inputs/TextArea"

interface EditPortfolioModalProps {
    portfolio: PortfolioResponse | null
    isOpen: boolean
    onClose: () => void
    onSubmit: (
        id: string,
        data: { name?: string; description?: string; is_public?: boolean }
    ) => void
    isLoading: boolean
}

const EditPortfolioModal = ({
    portfolio,
    isOpen,
    onClose,
    onSubmit,
    isLoading,
}: EditPortfolioModalProps) => {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [isPublic, setIsPublic] = useState(true)

    useEffect(() => {
        if (portfolio) {
            setName(portfolio.name)
            setDescription(portfolio.description || "")
            setIsPublic(portfolio.is_public)
        }
    }, [portfolio])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!portfolio) return

        onSubmit(portfolio.id, {
            name: name.trim(),
            description: description.trim() || undefined,
            is_public: isPublic,
        })
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