"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ExternalLink } from "lucide-react";
import vercelTokenSteps from "./tokenGuide";

interface TokenGuideDropdownProps {
    className?: string;
}

export default function TokenGuideDropdown({ className = "" }: TokenGuideDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeStep, setActiveStep] = useState<number | null>(vercelTokenSteps[0]?.id ?? null);

    const toggleStep = (id: number) => {
        setActiveStep((prev) => (prev === id ? null : id));
    };

    return (
        <div
            className={`font-league rounded-xl border border-[var(--foreground)]/10 bg-[var(--background)] text-[var(--foreground)] overflow-hidden ${className}`}
        >
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                aria-controls="vercel-token-guide-panel"
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-[var(--foreground)]/[0.03] transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent,#171717)]/10 text-[var(--accent,#171717)] text-xs font-semibold">
                        ?
                    </span>
                    <span className="text-sm font-league-600">Where do I find my Vercel token?</span>
                </div>
                <ChevronDown
                    size={16}
                    className={`shrink-0 text-[var(--foreground)]/50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            <div
                id="vercel-token-guide-panel"
                className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
            >
                <div className="overflow-hidden">
                    <div className="border-t border-[var(--foreground)]/10 px-4 py-3 max-h-96 overflow-y-auto custom-scrollbar">
                        <ol>
                            {vercelTokenSteps.map((step, idx) => {
                                const isActive = activeStep === step.id;
                                const isLast = idx === vercelTokenSteps.length - 1;

                                return (
                                    <li key={step.id} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <span
                                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-league-600 transition-colors ${isActive
                                                    ? "bg-[var(--accent,#171717)] text-[var(--background)]"
                                                    : "bg-[var(--foreground)]/10 text-[var(--foreground)]/60"
                                                    }`}
                                            >
                                                {step.id}
                                            </span>
                                            {!isLast && <span className="w-px flex-1 bg-[var(--foreground)]/10 my-1" />}
                                        </div>

                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => toggleStep(step.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault();
                                                    toggleStep(step.id);
                                                }
                                            }}
                                            className="flex-1 cursor-pointer pb-4 outline-none rounded-md focus-visible:ring-2 focus-visible:ring-[var(--accent,#171717)]/40"
                                        >
                                            <p
                                                className={`text-sm font-league-600 leading-tight ${isActive ? "text-[var(--foreground)]" : "text-[var(--foreground)]/70"
                                                    }`}
                                            >
                                                {step.title}
                                            </p>

                                            <div
                                                className={`grid transition-all duration-200 ease-in-out ${isActive ? "grid-rows-[1fr] opacity-100 mt-1.5" : "grid-rows-[0fr] opacity-0"
                                                    }`}
                                            >
                                                <div className="overflow-hidden">
                                                    <p className="text-[13px] text-[var(--foreground)]/60 leading-relaxed">
                                                        {step.description}
                                                    </p>

                                                    {step.imageUrl && (
                                                        <div className="mt-2 rounded-lg overflow-hidden border border-[var(--foreground)]/10">
                                                            <Image
                                                                src={step.imageUrl}
                                                                alt={step.title}
                                                                width={480}
                                                                height={280}
                                                                className="w-full h-auto object-cover"
                                                            />
                                                        </div>
                                                    )}

                                                    {step.actionUrl && (
                                                        <a
                                                            href={step.actionUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="mt-2 inline-flex items-center gap-1 text-[13px] font-league-500 text-[var(--accent,#171717)] hover:underline"
                                                        >
                                                            {step.actionLabel ?? "Open link"}
                                                            <ExternalLink size={12} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}