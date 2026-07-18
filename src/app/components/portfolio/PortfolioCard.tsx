"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import type { PortfolioResponse } from "@/portfolio-builder/store/usePortfolioStore"
import { copyToClipboard } from "@/lib/utilities/syncFunctions/syncs"
import { Share2, Pencil, Trash2, ExternalLink, Edit3 } from "lucide-react"
import Button from "../buttons/Buttons"
import ButtonGroup from "../buttons/ButtonGroup"

interface PortfolioCardProps {
    portfolio: PortfolioResponse
    onEdit: (portfolio: PortfolioResponse) => void
    onDelete: (id: string) => void
}

const PortfolioCard = ({ portfolio, onEdit, onDelete }: PortfolioCardProps) => {
    const router = useRouter()

    const handleShare = (slug: string) => {
        const fullUrl = window.location.href;
        copyToClipboard(`${fullUrl}/${slug}`)
    }

    const actions = [
        {
            id: 'open',
            label: 'Open Studio',
            icon: <Edit3 className="w-4 h-4" />,
            onClick: () => router.push(`portfolios/${portfolio.slug}/studio`),
            description: 'Open in studio editor'
        },
        {
            id: 'visit',
            label: 'Visit Portfolio Site',
            icon: <ExternalLink className="w-4 h-4" />,
            onClick: () => router.push(`portfolios/${portfolio.slug}`),
            description: 'Visit live portfolio site'
        },
        {
            id: 'share',
            label: 'Share',
            icon: <Share2 className="w-4 h-4" />,
            onClick: () => handleShare(portfolio.slug),
            description: 'Copy share link to clipboard'
        },
        {
            id: 'edit',
            label: 'Edit',
            icon: <Pencil className="w-4 h-4" />,
            onClick: () => onEdit(portfolio),
            description: 'Edit portfolio meta information'
        },
        {
            id: 'delete',
            label: 'Delete',
            icon: <Trash2 className="w-4 h-4" />,
            onClick: () => onDelete(portfolio.id),
            variant: 'danger' as const,
            description: 'Permanently delete this portfolio'
        }
    ]

    return (
        <div className="card rounded-xl border border-[var(--foreground)]/10 p-5 hover:border-[var(--accent)]/50 transition-all duration-200 group">
            <div className="h-40 bg-[var(--foreground)]/5 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                {portfolio.cover_image_url ? (
                    <img
                        src={portfolio.cover_image_url}
                        alt={portfolio.name || "Portfolio cover"}
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
            </div>

            <ButtonGroup
                actions={actions}
                defaultActionId="open"
                variant="primary"
                size="sm"
                className="w-full"
                dropdownPlacement="bottom"
            />
        </div>
    )
}

export default PortfolioCard