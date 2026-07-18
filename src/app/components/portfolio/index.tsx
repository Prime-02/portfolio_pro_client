"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import BasicHeader from "../containers/divs/header/BasicHeader"
import Button from "../buttons/Buttons"
import { usePortfolioStore } from "@/portfolio-builder/store/usePortfolioStore"
import type { PortfolioResponse, PortfolioCreate, PortfolioUpdate } from "@/portfolio-builder/store/usePortfolioStore"
import PortfolioSkeleton from "./PortfolioSkeleton"
import CreatePortfolioModal from "./CreatePortfolioModal"
import PortfolioCard from "./PortfolioCard"
import EditPortfolioModal from "./EditPortfolioModal"
import { useUserSettings } from "@/lib/stores/user/useUserSettings"
import ConfirmationModal from "../containers/modals/ConfirmationModal"


const PortfolioPage = () => {
    const router = useRouter()
    const [isCreating, setIsCreating] = useState(false)
    const [editingPortfolio, setEditingPortfolio] = useState<PortfolioResponse | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
        isOpen: boolean;
        portfolioId: string | null;
        portfolioTitle: string;
    }>({
        isOpen: false,
        portfolioId: null,
        portfolioTitle: "",
    })
    const { userInfo } = useUserSettings()

    const {
        portfolios,
        isLoading,
        error,
        fetchMyPortfolios,
        createPortfolio,
        updatePortfolio,
        deletePortfolio,
        clearError,
    } = usePortfolioStore()

    useEffect(() => {
        fetchMyPortfolios()
    }, [fetchMyPortfolios])

    const handleCreate = useCallback(
        async (data: PortfolioCreate) => {
            const hasDefault = portfolios.some((p) => p.is_default)

            const payload: PortfolioCreate = {
                ...data,
                is_default: !hasDefault,
                layout: data.layout || {}, // Include layout, default to empty object
            }

            try {
                const response = await createPortfolio(payload)
                setIsCreating(false)
                router.push(`/${userInfo?.username}/portfolios/${response.slug}/studio`)
            } catch (err) {
                // Error handled by store
            }
        },
        [portfolios, createPortfolio, router, userInfo?.username]
    )

    const handleEdit = useCallback(
        async (id: string, data: PortfolioUpdate) => {
            try {
                await updatePortfolio(id, data)
                setIsEditModalOpen(false)
                setEditingPortfolio(null)
                fetchMyPortfolios()
            } catch (err) {
                // Error handled by store
            }
        },
        [updatePortfolio]
    )

    const handleDeleteClick = (portfolio: PortfolioResponse) => {
        setDeleteConfirmModal({
            isOpen: true,
            portfolioId: portfolio.id,
            portfolioTitle: portfolio.name || "Untitled Portfolio",
        })
    }

    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteConfirmModal.portfolioId) return

        try {
            await deletePortfolio(deleteConfirmModal.portfolioId)
            setDeleteConfirmModal({ isOpen: false, portfolioId: null, portfolioTitle: "" })
        } catch (err) {
            // Error handled by store
            setDeleteConfirmModal({ isOpen: false, portfolioId: null, portfolioTitle: "" })
        }
    }, [deleteConfirmModal.portfolioId, deletePortfolio])

    const handleDeleteCancel = () => {
        setDeleteConfirmModal({ isOpen: false, portfolioId: null, portfolioTitle: "" })
    }

    const openEdit = (portfolio: PortfolioResponse) => {
        setEditingPortfolio(portfolio)
        setIsEditModalOpen(true)
    }

    return (
        <div className="min-h-screen text-[var(--foreground)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <header className="flex flex-wrap justify-between items-center gap-4 mb-10">
                    <BasicHeader
                        heading="Manage Your Portfolios"
                        subHeading="Create, edit, and share different custom portfolios for different purposes."
                    />
                    <div>
                        <Button
                            text="Create New Portfolio"
                            onClick={() => setIsCreating(true)}
                        />
                    </div>
                </header>

                {error && (
                    <div className="mb-6 p-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 flex items-center justify-between">
                        <span className="text-sm">{error}</span>
                        <button
                            onClick={clearError}
                            className="text-sm hover:underline"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {isLoading && portfolios.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <PortfolioSkeleton key={i} />
                        ))}
                    </div>
                ) : portfolios.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center mb-4">
                            <svg
                                className="w-10 h-10 text-[var(--foreground)]/20"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                            </svg>
                        </div>
                        <h3 className="font-league text-xl font-bold text-[var(--foreground)] mb-2">
                            No portfolios yet
                        </h3>
                        <p className="text-[var(--foreground)]/50 max-w-sm mb-6">
                            Get started by creating your first portfolio. You can customize it and add projects later.
                        </p>
                        <div>
                            <Button
                                text="Create Your First Portfolio"
                                onClick={() => setIsCreating(true)}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {portfolios.map((portfolio) => (
                            <PortfolioCard
                                key={portfolio.id}
                                portfolio={portfolio}
                                onEdit={openEdit}
                                onDelete={() => handleDeleteClick(portfolio)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CreatePortfolioModal
                isOpen={isCreating}
                onClose={() => setIsCreating(false)}
                onSubmit={handleCreate}
                isLoading={isLoading}
            />

            <EditPortfolioModal
                portfolio={editingPortfolio}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false)
                    setEditingPortfolio(null)
                }}
                onSubmit={handleEdit}
                isLoading={isLoading}
            />

            <ConfirmationModal
                isOpen={deleteConfirmModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Portfolio?"
                message={`Are you sure you want to delete "${deleteConfirmModal.portfolioTitle}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                loading={isLoading}
            />
        </div>
    )
}

export default PortfolioPage