// app/offline/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

export default function OfflinePage() {
    const [isOnline, setIsOnline] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleOnline = () => {
            setIsOnline(true);
            window.location.reload();
        };
        window.addEventListener("online", handleOnline);
        return () => window.removeEventListener("online", handleOnline);
    }, []);

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
                {/* Connection Icon - Fixed */}
                <div className="mb-8 flex justify-center">
                    <div
                        className="relative w-32 h-32 flex items-center justify-center rounded-full overflow-hidden"
                    >
                        {/* Background layer with low opacity */}
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                backgroundColor: "var(--accent)",
                                opacity: 0.1,
                            }}
                        />

                        {/* Icon - full visibility */}
                        {isOnline ? (
                            <Wifi
                                size={64}
                                strokeWidth={1.5}
                                className="relative z-10 animate-pulse"
                                style={{ color: "var(--accent)" }}
                            />
                        ) : (
                            <WifiOff
                                size={64}
                                strokeWidth={1.5}
                                className="relative z-10"
                                style={{ color: "var(--foreground)" }}
                            />
                        )}
                    </div>
                </div>

                {/* Divider line */}
                <div
                    className="w-16 h-[2px] mx-auto my-6 rounded-full"
                    style={{
                        background: "var(--accent)",
                        opacity: 0.6,
                    }}
                />

                {/* Heading */}
                <h2
                    className="font-league text-3xl md:text-4xl mb-4"
                    style={{
                        fontFamily: "var(--font-league)",
                        fontWeight: 700,
                        color: "var(--foreground)",
                    }}
                >
                    {isOnline ? "Reconnecting..." : "You're Offline"}
                </h2>

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
                    {isOnline
                        ? "Connection restored. Reloading the page..."
                        : "Please check your internet connection and try again."}
                </p>

                {/* CTA Button */}
                <button
                    onClick={() => window.location.reload()}
                    disabled={isOnline}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-league text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{
                        fontFamily: "var(--font-league)",
                        fontWeight: 600,
                        background: "var(--foreground)",
                        color: "var(--background)",
                        boxShadow: "0 4px 20px -4px var(--foreground)",
                    }}
                >
                    {isOnline ? (
                        <>
                            <Wifi size={18} strokeWidth={2} className="animate-spin" />
                            Reconnecting...
                        </>
                    ) : (
                        <>
                            <WifiOff size={18} strokeWidth={2} />
                            Retry Connection
                        </>
                    )}
                </button>
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
                {isOnline ? "Reconnecting" : "No Internet"} &mdash; Connection Lost
            </p>
        </div>
    );
}