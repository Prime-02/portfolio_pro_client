"use client";

// Breadcrumb.tsx — clickable folder path navigation

import type { BreadcrumbSegment } from "./types";

interface BreadcrumbProps {
    segments: BreadcrumbSegment[];
    onNavigate: (path: string) => void;
}

export function Breadcrumb({ segments, onNavigate }: BreadcrumbProps) {
    return (
        <div className="flex items-center gap-1 font-mono text-[11px]">
            <button
                onClick={() => onNavigate(segments[0]?.path.split("/")[0] || "")}
                className="px-1.5 py-0.5 rounded-sm transition-colors duration-150"
                style={{
                    color: "var(--foreground)",
                    opacity: 0.35,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.7";
                    e.currentTarget.style.backgroundColor = "rgba(var(--foreground-rgb, 255,255,255), 0.05)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0.35";
                    e.currentTarget.style.backgroundColor = "transparent";
                }}
            >
                🏠
            </button>

            {segments.map((segment, i) => (
                <div key={segment.path} className="flex items-center gap-1">
                    <span style={{ color: "var(--foreground)", opacity: 0.2 }}>/</span>
                    <button
                        onClick={() => onNavigate(segment.path)}
                        className="px-1.5 py-0.5 rounded-sm transition-colors duration-150 truncate max-w-[120px]"
                        style={{
                            color: "var(--foreground)",
                            opacity: i === segments.length - 1 ? 0.85 : 0.4,
                            fontWeight: i === segments.length - 1 ? 600 : 400,
                        }}
                        onMouseEnter={(e) => {
                            if (i !== segments.length - 1) {
                                e.currentTarget.style.opacity = "0.7";
                                e.currentTarget.style.backgroundColor = "rgba(var(--foreground-rgb, 255,255,255), 0.05)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (i !== segments.length - 1) {
                                e.currentTarget.style.opacity = "0.4";
                                e.currentTarget.style.backgroundColor = "transparent";
                            }
                        }}
                    >
                        {segment.label}
                    </button>
                </div>
            ))}
        </div>
    );
}