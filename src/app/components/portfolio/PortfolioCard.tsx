"use client"

import { useRouter } from "next/navigation"
import type { PortfolioResponse } from "@/portfolio-builder/store/usePortfolioStore"

interface PortfolioCardProps {
    portfolio: PortfolioResponse
    onEdit: (portfolio: PortfolioResponse) => void
    onDelete: (id: string) => void
}

const PortfolioCard = ({ portfolio, onEdit, onDelete }: PortfolioCardProps) => {
    const router = useRouter()

    return (
        <div className="card rounded-xl border border-[var(--foreground)]/10 p-5 hover:border-[var(--accent)]/50 transition-all duration-200 group">
            <div className="h-40 bg-[var(--foreground)]/5 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                {portfolio.cover_image_thumbnail ? (
                    <img
                        src={portfolio.cover_image_thumbnail}
                        alt={portfolio.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="text-[var(--foreground)]/20 font-league text-4xl font-bold">
                        {portfolio.name.charAt(0).toUpperCase()}
                    </div>
                )}
                {portfolio.is_default && (
                    <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-[var(--accent)] text-[var(--background)] rounded-md">
                        Default
                    </span>
                )}
            </div>

            <h3 className="font-league text-xl font-bold text-[var(--foreground)] mb-1 truncate">
                {portfolio.name}
            </h3>

            {portfolio.description && (
                <p className="text-sm text-[var(--foreground)]/60 mb-4 line-clamp-2">
                    {portfolio.description}
                </p>
            )}

            <div className="flex items-center gap-2 mb-4">
                <span
                    className={`px-2 py-1 text-xs font-medium rounded-md ${portfolio.is_public
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                >
                    {portfolio.is_public ? "Public" : "Private"}
                </span>
                <span className="text-xs text-[var(--foreground)]/40">
                    {portfolio.project_count} project{portfolio.project_count !== 1 ? "s" : ""}
                </span>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => router.push(`/portfolios/${portfolio.slug}/studio`)}
                    className="flex-1 px-4 py-2 text-sm font-medium bg-[var(--accent)] text-[var(--background)] rounded-lg hover:opacity-90 transition-opacity"
                >
                    Open Studio
                </button>
                <button
                    onClick={() => onEdit(portfolio)}
                    className="px-4 py-2 text-sm font-medium border border-[var(--foreground)]/20 text-[var(--foreground)] rounded-lg hover:bg-[var(--foreground)]/5 transition-colors"
                >
                    Edit
                </button>
                <button
                    onClick={() => onDelete(portfolio.id)}
                    className="px-4 py-2 text-sm font-medium border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                    Delete
                </button>
            </div>
        </div>
    )
}

export default PortfolioCard