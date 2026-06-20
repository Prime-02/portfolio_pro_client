"use client";

import { FileText, Image, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import type { CreateBlogTab } from "./CreateBlogTabs";

const TAB_ORDER: CreateBlogTab[] = ["basic", "media", "settings"];

const TAB_META: Record<CreateBlogTab, { label: string; icon: typeof FileText }> = {
    basic: { label: "Basic Info", icon: FileText },
    media: { label: "Media", icon: Image },
    settings: { label: "Settings", icon: Settings },
};

interface CreateBlogBottomNavProps {
    activeTab: CreateBlogTab;
    onChange: (tab: CreateBlogTab) => void;
}

export function CreateBlogBottomNav({ activeTab, onChange }: CreateBlogBottomNavProps) {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    const prevTab = currentIndex > 0 ? TAB_ORDER[currentIndex - 1] : null;
    const nextTab = currentIndex < TAB_ORDER.length - 1 ? TAB_ORDER[currentIndex + 1] : null;

    return (
        <div className="mt-10 pt-6 border-t border-[var(--foreground)]/8">
            <div className="flex items-center justify-between gap-4">
                {/* Prev */}
                {prevTab ? (
                    <button
                        onClick={() => onChange(prevTab)}
                        className="group flex items-center gap-2 px-4 py-2.5 rounded-xl
                            border border-[var(--foreground)]/10 bg-[var(--foreground)]/3
                            text-[var(--foreground)]/50 hover:text-[var(--foreground)]/80
                            hover:border-[var(--foreground)]/20 hover:bg-[var(--foreground)]/6
                            transition-all text-sm font-medium"
                    >
                        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                        <span className="flex items-center gap-1.5">
                            {(() => {
                                const Icon = TAB_META[prevTab].icon;
                                return <Icon className="w-3.5 h-3.5" />;
                            })()}
                            {TAB_META[prevTab].label}
                        </span>
                    </button>
                ) : (
                    <div />
                )}

                {/* Step dots */}
                <div className="flex items-center gap-1.5">
                    {TAB_ORDER.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => onChange(tab)}
                            aria-label={`Go to ${TAB_META[tab].label}`}
                            className={`rounded-full transition-all duration-200 ${tab === activeTab
                                    ? "w-5 h-2 bg-[var(--accent)]"
                                    : "w-2 h-2 bg-[var(--foreground)]/20 hover:bg-[var(--foreground)]/40"
                                }`}
                        />
                    ))}
                </div>

                {/* Next */}
                {nextTab ? (
                    <button
                        onClick={() => onChange(nextTab)}
                        className="group flex items-center gap-2 px-4 py-2.5 rounded-xl
                            border border-[var(--accent)]/20 bg-[var(--accent)]/8
                            text-[var(--accent)] hover:bg-[var(--accent)]/15
                            hover:border-[var(--accent)]/35
                            transition-all text-sm font-medium"
                    >
                        <span className="flex items-center gap-1.5">
                            {(() => {
                                const Icon = TAB_META[nextTab].icon;
                                return <Icon className="w-3.5 h-3.5" />;
                            })()}
                            {TAB_META[nextTab].label}
                        </span>
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                ) : (
                    <div />
                )}
            </div>
        </div>
    );
}