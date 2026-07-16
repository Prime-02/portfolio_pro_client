// app/install-app/components/InstallCTA.tsx
import React, { useState } from "react";
import { usePWA } from "@/lib/hooks/pwa/usePWA";
import { Download, Sparkles } from "lucide-react";

interface InstallCTAProps {
    isInstallable: boolean;
}

const InstallCTA: React.FC<InstallCTAProps> = ({ isInstallable }) => {
    const { installApp } = usePWA();
    const [isInstalling, setIsInstalling] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleInstall = async () => {
        setIsInstalling(true);
        try {
            const success = await installApp();
            if (success) {
                setShowSuccess(true);
            }
        } catch (error) {
            console.error("Installation failed:", error);
        } finally {
            setIsInstalling(false);
        }
    };

    if (showSuccess) {
        return (
            <section className="py-16 px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <div
                        className="p-8 rounded-2xl"
                        style={{
                            background:
                                "color-mix(in srgb, var(--foreground) 3%, transparent)",
                            border: "1px solid rgba(var(--accent-rgb), 0.2)",
                        }}
                    >
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                            style={{
                                background:
                                    "color-mix(in srgb, var(--accent) 10%, transparent)",
                            }}
                        >
                            <Sparkles size={32} style={{ color: "var(--accent)" }} />
                        </div>
                        <h2
                            className="font-league text-3xl mb-4"
                            style={{
                                fontFamily: "var(--font-league)",
                                fontWeight: 700,
                            }}
                        >
                            Installation Started!
                        </h2>
                        <p
                            className="text-lg"
                            style={{
                                color: "var(--foreground)",
                                opacity: 0.6,
                            }}
                        >
                            Check your browser's installation prompt to complete the setup.
                            The app will open automatically once installed.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 px-6">
            <div className="max-w-2xl mx-auto text-center">
                {/* CTA Card */}
                <div
                    className="relative p-8 md:p-12 rounded-3xl overflow-hidden"
                    style={{
                        background:
                            "color-mix(in srgb, var(--foreground) 3%, transparent)",
                        border: "1px solid rgba(var(--accent-rgb), 0.2)",
                    }}
                >
                    {/* Gradient effect */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background:
                                "linear-gradient(135deg, color-mix(in srgb, var(--accent) 5%, transparent), transparent)",
                        }}
                    />

                    <div className="relative z-10">
                        <h2
                            className="font-league text-3xl md:text-4xl mb-4"
                            style={{
                                fontFamily: "var(--font-league)",
                                fontWeight: 700,
                            }}
                        >
                            Ready to Get Started?
                        </h2>
                        <p
                            className="text-lg mb-8 max-w-lg mx-auto"
                            style={{
                                color: "var(--foreground)",
                                opacity: 0.6,
                                lineHeight: 1.7,
                            }}
                        >
                            Install PortfolioPro now and enjoy a faster, more reliable
                            experience with offline access and native app features.
                        </p>

                        {/* Install Button */}
                        <button
                            onClick={handleInstall}
                            disabled={!isInstallable || isInstalling}
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-league text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            style={{
                                fontFamily: "var(--font-league)",
                                fontWeight: 600,
                                background: isInstallable
                                    ? "var(--accent)"
                                    : "var(--foreground)",
                                color: "var(--background)",
                                boxShadow: isInstallable
                                    ? "0 4px 20px -4px var(--accent)"
                                    : "none",
                            }}
                        >
                            <Download size={20} />
                            {isInstalling
                                ? "Installing..."
                                : isInstallable
                                    ? "Install PortfolioPro"
                                    : "Not Available"}
                        </button>

                        {!isInstallable && (
                            <p
                                className="text-sm mt-4"
                                style={{
                                    color: "var(--foreground)",
                                    opacity: 0.4,
                                }}
                            >
                                Installation is not currently available. Please see browser
                                requirements below.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InstallCTA;