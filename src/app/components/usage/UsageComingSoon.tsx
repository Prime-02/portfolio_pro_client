"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, Home } from "lucide-react";

export default function UsageComingSoon() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Helper to convert hex to rgba
    const hexToRgba = (hex: string, alpha: number) => {
        // This assumes you're using CSS variables, so we'll use inline styles with rgba
        return `rgba(var(--accent-rgb), ${alpha})`;
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-6"
            style={{
                background: "var(--background)",
                color: "var(--foreground)",
            }}
        >
            <div
                className={`relative z-10 text-center max-w-lg transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    }`}
            >
                {/* Coming Soon Icon/Graphic - Fixed */}
                <div
                    className="mx-auto mb-8 w-28 h-28 rounded-2xl flex items-center justify-center relative overflow-hidden"
                    style={{
                        position: "relative",
                    }}
                >
                    {/* Background layer with low opacity */}
                    <div
                        className="absolute inset-0 rounded-2xl"
                        style={{
                            backgroundColor: "var(--accent)",
                            opacity: 0.08,
                        }}
                    />

                    {/* Icon - full visibility */}
                    <BarChart3
                        size={56}
                        strokeWidth={1.5}
                        className="relative z-10"
                        style={{
                            color: "var(--accent)",
                        }}
                    />

                    {/* Decorative dots */}
                    <div
                        className="absolute top-4 right-4 w-2 h-2 rounded-full z-10"
                        style={{ backgroundColor: "var(--accent)", opacity: 0.4 }}
                    />
                    <div
                        className="absolute bottom-4 left-4 w-2 h-2 rounded-full z-10"
                        style={{ backgroundColor: "var(--accent)", opacity: 0.4 }}
                    />
                    <div
                        className="absolute top-3 left-6 w-1.5 h-1.5 rounded-full z-10"
                        style={{ backgroundColor: "var(--accent)", opacity: 0.2 }}
                    />
                </div>

                {/* Heading */}
                <h2
                    className="font-league text-3xl md:text-4xl mb-2"
                    style={{
                        fontFamily: "var(--font-league)",
                        fontWeight: 700,
                        color: "var(--foreground)",
                    }}
                >
                    Usage Analytics
                </h2>

                {/* Coming Soon Badge - Fixed */}
                <div
                    className="inline-block px-4 py-1.5 rounded-full mb-6 relative overflow-hidden"
                >
                    {/* Background layer with low opacity */}
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            backgroundColor: "var(--accent)",
                            opacity: 0.15,
                        }}
                    />

                    {/* Text - full visibility */}
                    <span
                        className="relative z-10 font-league text-xs tracking-wider uppercase"
                        style={{
                            fontFamily: "var(--font-league)",
                            fontWeight: 600,
                            color: "var(--accent)",
                        }}
                    >
                        Coming Soon
                    </span>
                </div>

                {/* Divider line */}
                <div
                    className="w-16 h-[2px] mx-auto my-6 rounded-full"
                    style={{
                        background: "var(--accent)",
                        opacity: 0.6,
                    }}
                />

                {/* Description */}
                <p
                    className="text-base md:text-lg mb-10 leading-relaxed"
                    style={{
                        color: "var(--foreground)",
                        opacity: 0.6,
                        maxWidth: "420px",
                        marginLeft: "auto",
                        marginRight: "auto",
                    }}
                >
                   {` We're building detailed usage insights and analytics to help you
                    understand your activity patterns. Stay tuned for powerful
                    visualizations and tracking features.`}
                </p>

                {/* CTA Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-league text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                        fontFamily: "var(--font-league)",
                        fontWeight: 600,
                        background: "var(--foreground)",
                        color: "var(--background)",
                        boxShadow: "0 4px 20px -4px var(--foreground)",
                    }}
                >
                    <Home size={18} strokeWidth={2} />
                    Back to Home
                </Link>
            </div>

            {/* Bottom decorative text */}
            <p
                className="absolute bottom-8 text-xs tracking-widest uppercase font-league"
                style={{
                    fontFamily: "var(--font-league)",
                    fontWeight: 500,
                    color: "var(--foreground)",
                    opacity: 0.15,
                }}
            >
                Usage &mdash; Coming Soon
            </p>
        </div>
    );
}