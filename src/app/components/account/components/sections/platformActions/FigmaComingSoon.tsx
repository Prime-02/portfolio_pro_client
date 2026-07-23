import Button from '@/src/app/components/buttons/Buttons'
import Image from '@/src/app/components/ui/Image'
import React from 'react'

// ============ Sub-components ============

const FigmaHeader = () => {

    return (
        <div className="flex items-center justify-between pb-3 border-b border-[var(--foreground)]/30">
            <div className="flex items-center gap-2">
                <Image
                    className='w-10 h-10 object-contain opacity-70'
                    src={`/socials/figma/Figma_Symbol_6.svg`}
                    alt="Figma"
                    width={40}
                    height={40}
                />
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-base font-league-600 text-foreground">Figma</p>
                        <span className="text-[10px] font-league-500 px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                            Coming Soon
                        </span>
                    </div>
                    <p className="text-xs text-[var(--foreground)]/60 font-league-400">
                        Not yet available
                    </p>
                </div>
            </div>

            <Button
                text='Notify Me'
                size='sm'
                variant='ghost'
                disabled
                title="We'll let you know when Figma import is ready"
            />
        </div>
    )
}

const FigmaEmptyState = () => {

    return (
        <div className="flex flex-col items-center gap-4 py-6">
            <div className="relative">
                <Image
                    className='w-16 h-16 object-contain'
                    src={`/socials/figma/Figma_Symbol_6.svg`}
                    alt="Figma"
                    width={64}
                    height={64}
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4m5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>

            <div className="text-center space-y-1">
                <p className="text-sm font-league-600 text-foreground">
                    Figma integration is on the way
                </p>
                <p className="text-xs text-[var(--foreground)]/60 font-league-400 max-w-xs">
                    Soon you&apos;ll be able to import Figma files and showcase your design work directly on your portfolio.
                </p>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--foreground)]/10 bg-[var(--foreground)]/[0.02]">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-xs text-[var(--foreground)]/40 font-league-400">
                    In development
                </span>
            </div>
        </div>
    )
}

const FigmaInfoFooter = () => {
    return (
        <div className="pt-3 border-t border-[var(--foreground)]/10">
            <div className="flex items-start gap-2">
                <svg className="w-3.5 h-3.5 text-[var(--foreground)]/30 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-[var(--foreground)]/40 font-league-400">
                    We&apos;re building Figma sync so you can pull design files straight into your Projects section.
                </p>
            </div>
        </div>
    )
}

// ============ Main Component ============

const FigmaComingSoon = () => {
    return (
        <div className="space-y-4">
            <FigmaHeader />
            <FigmaEmptyState />
            <FigmaInfoFooter />
        </div>
    )
}

export default FigmaComingSoon