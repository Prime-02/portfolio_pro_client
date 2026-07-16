// app/install-app/components/BrowserDetection.tsx
import React from "react";
import { Chrome, Compass, Globe } from "lucide-react";

interface BrowserInfo {
    name: string;
    icon: React.ReactNode;
    supported: boolean;
    instruction: string;
}

const browsers: BrowserInfo[] = [
    {
        name: "Chrome",
        icon: <Chrome size={24} />,
        supported: true,
        instruction:
            "Click the install icon in the address bar or use the button above.",
    },
    {
        name: "Edge",
        icon: <Compass size={24} />,
        supported: true,
        instruction:
            "Look for the app install icon in the address bar or settings menu.",
    },
    {
        name: "Safari",
        icon: <Globe size={24} />,
        supported: true,
        instruction:
            "Tap the Share button and select 'Add to Home Screen' from the menu.",
    },
];

const BrowserDetection: React.FC = () => {
    return (
        <section className="py-16 md:py-24 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2
                        className="font-league text-2xl md:text-3xl mb-4"
                        style={{
                            fontFamily: "var(--font-league)",
                            fontWeight: 700,
                        }}
                    >
                        Supported Browsers
                    </h2>
                    <div
                        className="w-16 h-[2px] mx-auto mb-6 rounded-full"
                        style={{
                            background: "var(--accent)",
                            opacity: 0.6,
                        }}
                    />
                </div>

                {/* Browser Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    {browsers.map((browser, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-2xl text-center"
                            style={{
                                background:
                                    "color-mix(in srgb, var(--foreground) 3%, transparent)",
                                border: "1px solid rgba(var(--accent-rgb), 0.1)",
                            }}
                        >
                            {/* Browser Icon */}
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                                style={{
                                    background: browser.supported
                                        ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                                        : "color-mix(in srgb, var(--foreground) 5%, transparent)",
                                    color: browser.supported
                                        ? "var(--accent)"
                                        : "var(--foreground)",
                                }}
                            >
                                {browser.icon}
                            </div>

                            {/* Browser Name */}
                            <h3
                                className="font-league text-lg mb-2"
                                style={{
                                    fontFamily: "var(--font-league)",
                                    fontWeight: 600,
                                }}
                            >
                                {browser.name}
                            </h3>

                            {/* Support Badge */}
                            <div
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs mb-3"
                                style={{
                                    background: browser.supported
                                        ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                                        : "color-mix(in srgb, var(--foreground) 5%, transparent)",
                                    color: browser.supported
                                        ? "var(--accent)"
                                        : "var(--foreground)",
                                }}
                            >
                                <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{
                                        background: browser.supported
                                            ? "var(--accent)"
                                            : "var(--foreground)",
                                    }}
                                />
                                {browser.supported ? "Supported" : "Limited Support"}
                            </div>

                            {/* Instructions */}
                            <p
                                className="text-xs leading-relaxed"
                                style={{
                                    color: "var(--foreground)",
                                    opacity: 0.5,
                                }}
                            >
                                {browser.instruction}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Additional Info */}
                <div
                    className="mt-8 p-6 rounded-2xl"
                    style={{
                        background:
                            "color-mix(in srgb, var(--foreground) 2%, transparent)",
                        border: "1px solid rgba(var(--accent-rgb), 0.1)",
                    }}
                >
                    <p
                        className="text-sm text-center"
                        style={{
                            color: "var(--foreground)",
                            opacity: 0.5,
                            lineHeight: 1.6,
                        }}
                    >
                        {`PortfolioPro works on all modern browsers. For the best experience,
                        we recommend using Chrome, Edge, or Safari. Mobile users can install
                        directly from their browser's share menu.`}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default BrowserDetection;