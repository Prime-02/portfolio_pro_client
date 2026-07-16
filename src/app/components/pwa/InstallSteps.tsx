// app/install-app/components/InstallSteps.tsx
import React from "react";

interface InstallStepsProps {
    isInstallable: boolean;
}

const InstallSteps: React.FC<InstallStepsProps> = ({ isInstallable }) => {
    const steps = [
        {
            step: "01",
            title: "Click Install Button",
            description: "Tap the install button that appears at the bottom of this page or in your browser's address bar.",
        },
        {
            step: "02",
            title: "Confirm Installation",
            description: "A prompt will appear asking you to confirm. Click 'Install' to proceed with the setup.",
        },
        {
            step: "03",
            title: "Start Using",
            description: "The app will open in its own window. Pin it to your dock or taskbar for quick access.",
        },
    ];

    return (
        <section className="py-16 md:py-24 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2
                        className="font-league text-3xl md:text-4xl mb-4"
                        style={{
                            fontFamily: "var(--font-league)",
                            fontWeight: 700,
                        }}
                    >
                        How to Install
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
                        Three simple steps to get started with the Portfolio Pro app
                    </p>
                </div>

                {/* Steps */}
                <div className="relative">
                    {/* Connecting line */}
                    <div
                        className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] transform -translate-x-1/2"
                        style={{
                            background: "var(--accent)",
                            opacity: 0.2,
                        }}
                    />

                    <div className="space-y-12">
                        {steps.map((item, index) => (
                            <div
                                key={index}
                                className={`relative flex flex-col md:flex-row gap-6 md:gap-12 items-center ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                                    }`}
                            >
                                {/* Step Number */}
                                <div
                                    className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center z-10"
                                    style={{
                                        background: "var(--background)",
                                        border: "2px solid var(--accent)",
                                        borderColor: isInstallable
                                            ? "var(--accent)"
                                            : "color-mix(in srgb, var(--accent) 40%, transparent)",
                                    }}
                                >
                                    <span
                                        className="font-league text-2xl"
                                        style={{
                                            fontFamily: "var(--font-league)",
                                            fontWeight: 700,
                                            color: "var(--accent)",
                                        }}
                                    >
                                        {item.step}
                                    </span>
                                </div>

                                {/* Content Card */}
                                <div
                                    className="flex-1 p-6 rounded-2xl"
                                    style={{
                                        background:
                                            "color-mix(in srgb, var(--foreground) 3%, transparent)",
                                        border: "1px solid rgba(var(--accent-rgb), 0.3)",
                                    }}
                                >
                                    <h3
                                        className="font-league text-xl mb-2"
                                        style={{
                                            fontFamily: "var(--font-league)",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {item.title}
                                    </h3>
                                    <p
                                        className="text-sm leading-relaxed"
                                        style={{
                                            color: "var(--foreground)",
                                            opacity: 0.6,
                                        }}
                                    >
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InstallSteps;