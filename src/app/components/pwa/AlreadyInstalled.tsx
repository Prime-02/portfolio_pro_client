// app/install-app/components/AlreadyInstalled.tsx
import React from "react";
import Link from "next/link";
import { CheckCircle, Home, ExternalLink } from "lucide-react";

interface AlreadyInstalledProps {
    mounted: boolean;
}

const AlreadyInstalled: React.FC<AlreadyInstalledProps> = ({ mounted }) => {
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
                {/* Success Icon */}
                <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
                    style={{
                        background:
                            "color-mix(in srgb, var(--accent) 10%, transparent)",
                    }}
                >
                    <CheckCircle
                        size={40}
                        style={{ color: "var(--accent)" }}
                        strokeWidth={2}
                    />
                </div>

                {/* Heading */}
                <h1
                    className="font-league text-3xl md:text-4xl mb-4"
                    style={{
                        fontFamily: "var(--font-league)",
                        fontWeight: 700,
                    }}
                >
                    App Already Installed!
                </h1>

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
                    }}
                >
                    You&apos;re already using the installed version of PortfolioPro. Enjoy
                    the full native experience with offline access and faster performance.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/feed"
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
                        Go to Feed
                    </Link>

                    <button
                        onClick={() => window.open("/feed", "_blank")}
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-league text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            fontFamily: "var(--font-league)",
                            fontWeight: 600,
                            background: "transparent",
                            color: "var(--foreground)",
                            border: "1px solid var(--accent)",
                            borderColor: "rgba(var(--accent-rgb), 0.3)"
                        }}
                    >
                        <ExternalLink size={18} strokeWidth={2} />
                        Open in New Window
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlreadyInstalled;