// app/install-app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { usePWA } from "@/lib/hooks/pwa/usePWA";
import InstallHero from "./InstallHero";
import FeatureGrid from "./FeatureGrid";
import InstallSteps from "./InstallSteps";
import InstallCTA from "./InstallCTA";
import AlreadyInstalled from "./AlreadyInstalled";
import BrowserDetection from "./BrowserDetection";

export default function InstallAppPage() {
    const { isInstalled, isInstallable, isStandalone } = usePWA();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Show different content based on installation state
    if (isInstalled || isStandalone) {
        return <AlreadyInstalled mounted={mounted} />;
    }

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                background: "var(--background)",
                color: "var(--foreground)",
            }}
        >
            {/* Animated gradient background blob */}
            <div
                className="fixed inset-0 overflow-hidden pointer-events-none"
                aria-hidden="true"
            >
                <div
                    className="animated-gradient absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-[0.03]"
                    style={{
                        background:
                            "radial-gradient(circle at 30% 30%, var(--accent), transparent 40%), radial-gradient(circle at 70% 70%, var(--foreground), transparent 40%)",
                    }}
                />
            </div>

            <div
                className={`relative z-10 flex-1 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    }`}
            >
                {/* Hero Section */}
                <InstallHero />

                {/* Feature Grid */}
                <FeatureGrid />

                {/* Install Steps */}
                <InstallSteps isInstallable={isInstallable} />

                {/* Call to Action */}
                <InstallCTA isInstallable={isInstallable} />

                {/* Browser Detection Info */}
                <BrowserDetection />
            </div>
        </div>
    );
}