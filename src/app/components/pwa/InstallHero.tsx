// app/install-app/components/InstallHero.tsx
import React from "react";
import Image from "next/image";

const InstallHero: React.FC = () => {
    return (
        <section className="relative pt-20 pb-12 md:pt-32 md:pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="text-center md:text-left">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                            style={{
                                background:
                                    "color-mix(in srgb, var(--foreground) 5%, transparent)",
                                border: "1px solid rgba(var(--accent-rgb), 0.2)",
                            }}
                        >
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ background: "var(--accent)" }}
                            />
                            <span
                                className="text-sm font-league"
                                style={{
                                    fontFamily: "var(--font-league)",
                                    fontWeight: 500,
                                    color: "var(--foreground)",
                                    opacity: 0.7,
                                }}
                            >
                                Progressive Web App
                            </span>
                        </div>

                        <h1
                            className="font-league text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight"
                            style={{
                                fontFamily: "var(--font-league)",
                                fontWeight: 800,
                            }}
                        >
                            Install{" "}
                            <span
                                style={{
                                    background:
                                        "linear-gradient(135deg, var(--foreground) 0%, var(--accent) 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                Portfolio Pro
                            </span>{" "}
                            for a Better Experience
                        </h1>

                        <p
                            className="text-lg mb-8 max-w-lg mx-auto md:mx-0"
                            style={{
                                color: "var(--foreground)",
                                opacity: 0.6,
                                lineHeight: 1.7,
                            }}
                        >
                            Get instant access, offline support, and a native app-like experience.
                            No app store required — just one click.
                        </p>

                        {/* Quick stats */}
                        <div className="flex gap-8 justify-center md:justify-start">
                            <div className="text-center">
                                <div
                                    className="font-league text-2xl md:text-3xl mb-1"
                                    style={{
                                        fontFamily: "var(--font-league)",
                                        fontWeight: 700,
                                        color: "var(--accent)",
                                    }}
                                >
                                    &lt;1s
                                </div>
                                <div
                                    className="text-sm"
                                    style={{
                                        color: "var(--foreground)",
                                        opacity: 0.5,
                                    }}
                                >
                                    Install Time
                                </div>
                            </div>
                            <div className="text-center">
                                <div
                                    className="font-league text-2xl md:text-3xl mb-1"
                                    style={{
                                        fontFamily: "var(--font-league)",
                                        fontWeight: 700,
                                        color: "var(--accent)",
                                    }}
                                >
                                    &lt;5MB
                                </div>
                                <div
                                    className="text-sm"
                                    style={{
                                        color: "var(--foreground)",
                                        opacity: 0.5,
                                    }}
                                >
                                    App Size
                                </div>
                            </div>
                            <div className="text-center">
                                <div
                                    className="font-league text-2xl md:text-3xl mb-1"
                                    style={{
                                        fontFamily: "var(--font-league)",
                                        fontWeight: 700,
                                        color: "var(--accent)",
                                    }}
                                >
                                    100%
                                </div>
                                <div
                                    className="text-sm"
                                    style={{
                                        color: "var(--foreground)",
                                        opacity: 0.5,
                                    }}
                                >
                                    Offline Ready
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Desktop App Preview */}
                    <div className="relative hidden md:block">
                        <div
                            className="relative mx-auto"
                            style={{
                                maxWidth: "540px", // Increased for larger desktop image
                            }}
                        >
                            {/* Decorative background */}
                            <div
                                className="absolute inset-0 rounded-3xl transform rotate-6 scale-105"
                                style={{
                                    background: "var(--accent)",
                                    opacity: 0.1,
                                }}
                            />

                            {/* Desktop screenshot container */}
                            <div
                                className="relative rounded-2xl overflow-hidden"
                                style={{
                                    border: "2px solid var(--foreground)",
                                    borderColor: "rgba(var(--accent-rgb), 0.3)",
                                    boxShadow: "0 25px 50px -12px var(--foreground)",
                                }}
                            >
                                <img
                                    src="/desktop-pwa.png"
                                    alt="Portfolio Pro App Preview"
                                    width={1080}
                                    height={675}
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* Floating badge */}
                            <div
                                className="absolute -bottom-4 -right-4 px-4 py-2 rounded-xl"
                                style={{
                                    background: "var(--background)",
                                    border: "1px solid var(--accent)",
                                    boxShadow: "0 10px 25px -5px var(--foreground)",
                                }}
                            >
                                <span
                                    className="font-league text-sm"
                                    style={{
                                        fontFamily: "var(--font-league)",
                                        fontWeight: 600,
                                        color: "var(--foreground)",
                                    }}
                                >
                                    ⚡ Fast & Light
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Mockup - Visible only on mobile */}
                    <div className="relative md:hidden mt-8">
                        <div
                            className="relative mx-auto"
                            style={{
                                maxWidth: "280px",
                            }}
                        >
                            {/* Mobile phone mockup */}
                            <div
                                className="relative rounded-3xl overflow-hidden"
                                style={{
                                    border: "3px solid var(--foreground)",
                                    borderColor: "rgba(var(--accent-rgb), 0.3)",
                                    boxShadow: "0 25px 50px -12px var(--foreground)",
                                }}
                            >
                                <img
                                    src="/mobile-pwa.png"
                                    alt="Portfolio Pro Mobile App Preview"
                                    width={560}
                                    height={1064}
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* Floating badge for mobile */}
                            <div
                                className="absolute -bottom-3 -right-3 px-3 py-1.5 rounded-lg"
                                style={{
                                    background: "var(--background)",
                                    border: "1px solid var(--accent)",
                                    boxShadow: "0 10px 25px -5px var(--foreground)",
                                }}
                            >
                                <span
                                    className="font-league text-xs"
                                    style={{
                                        fontFamily: "var(--font-league)",
                                        fontWeight: 600,
                                        color: "var(--foreground)",
                                    }}
                                >
                                    ⚡ Fast & Light
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InstallHero;