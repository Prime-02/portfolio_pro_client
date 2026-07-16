// app/install-app/components/FeatureGrid.tsx
import React from "react";
import { Zap, Wifi, Smartphone, Bell, Shield, Rocket } from "lucide-react";

interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const features: Feature[] = [
    {
        icon: <Zap size={24} />,
        title: "Lightning Fast",
        description:
            "Instant loading with cached assets and service worker optimization. Experience near-native performance.",
    },
    {
        icon: <Wifi size={24} />,
        title: "Works Offline",
        description:
            "Access your portfolio data even without an internet connection. Perfect for on-the-go access.",
    },
    {
        icon: <Smartphone size={24} />,
        title: "Native Feel",
        description:
            "Full-screen experience with your app icon on the home screen. No browser tabs or address bars.",
    },
    {
        icon: <Bell size={24} />,
        title: "Push Notifications",
        description:
            "Stay updated with real-time alerts about market changes, portfolio updates, and important news.",
    },
    {
        icon: <Shield size={24} />,
        title: "Secure & Private",
        description:
            "Your data stays on your device with encrypted local storage. No additional permissions required.",
    },
    {
        icon: <Rocket size={24} />,
        title: "Auto Updates",
        description:
            "Always get the latest features and improvements automatically without manual updates.",
    },
];

const FeatureGrid: React.FC = () => {
    return (
        <section className="py-16 md:py-24 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2
                        className="font-league text-3xl md:text-4xl mb-4"
                        style={{
                            fontFamily: "var(--font-league)",
                            fontWeight: 700,
                        }}
                    >
                        Why Install Our App?
                    </h2>
                    <div
                        className="w-16 h-[2px] mx-auto mb-6 rounded-full"
                        style={{
                            background: "var(--accent)",
                            opacity: 0.6,
                        }}
                    />
                    <p
                        className="text-lg max-w-2xl mx-auto"
                        style={{
                            color: "var(--foreground)",
                            opacity: 0.6,
                        }}
                    >
                        Get the most out of Portfolio Pro with these powerful features
                        available exclusively in the installed version.
                    </p>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                            style={{
                                background:
                                    "color-mix(in srgb, var(--foreground) 3%, transparent)",
                                border: "1px solid rgba(var(--accent-rgb), 0.1)",
                            }}
                        >
                            {/* Hover effect gradient */}
                            <div
                                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{
                                    background:
                                        "linear-gradient(135deg, color-mix(in srgb, var(--accent) 8%, transparent), transparent)",
                                }}
                            />

                            <div className="relative z-10">
                                {/* Icon */}
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                    style={{
                                        background:
                                            "color-mix(in srgb, var(--accent) 10%, transparent)",
                                        color: "var(--accent)",
                                    }}
                                >
                                    {feature.icon}
                                </div>

                                {/* Title */}
                                <h3
                                    className="font-league text-xl mb-2"
                                    style={{
                                        fontFamily: "var(--font-league)",
                                        fontWeight: 600,
                                    }}
                                >
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p
                                    className="text-sm leading-relaxed"
                                    style={{
                                        color: "var(--foreground)",
                                        opacity: 0.6,
                                    }}
                                >
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeatureGrid;