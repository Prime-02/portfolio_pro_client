import { useEffect, useRef, useState } from "react";
import { registerBackground } from "../../editor/BackgroundRegistry";
import Hyperspeed from "@/components/Hyperspeed";
import { hyperspeedPresets } from "@/components/HyperSpeedPresets";

type HyperspeedPresetKey = "one" | "two" | "three" | "four" | "five" | "six";

// Mounts Hyperspeed only once its container has a real, non-zero size.
// This avoids constructing the WebGL renderer/camera/composer with a 1x1
// (or otherwise bogus) initial size, which is what was causing the blank
// canvas on first load — toggling the preset was working around it by
// forcing a full remount after the layout had already settled.
function HyperspeedMount({ presetKey }: { presetKey: HyperspeedPresetKey }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        // Already sized (e.g. fast layout) — no need to wait.
        if (el.offsetWidth > 0 && el.offsetHeight > 0) {
            setReady(true);
            return;
        }

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                console.log("[HyperspeedMount] ResizeObserver fired", { width, height });
                if (width > 0 && height > 0) {
                    setReady(true);
                    observer.disconnect();
                    break;
                }
            }
        });

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            {(() => {
                console.log("[HyperspeedMount] render, ready =", ready, {
                    width: containerRef.current?.offsetWidth,
                    height: containerRef.current?.offsetHeight,
                });
                return null;
            })()}
            {ready && <Hyperspeed effectOptions={hyperspeedPresets[presetKey]} />}
        </div>
    );
}

registerBackground({
    type: "hyperspeed",
    label: "Hyperspeed",
    fields: [
        {
            kind: "dropdown", label: "Preset", key: "hyperspeedPreset", defaultValue: "one", options: [
                { id: "one", code: "Cyberpunk" },
                { id: "two", code: "Neon" },
                { id: "three", code: "Galaxy" },
                { id: "four", code: "Sunset" },
                { id: "five", code: "Inferno" },
                { id: "six", code: "Deep" }
            ]
        },
    ],
    defaults: {
        type: "hyperspeed",
        hyperspeedPreset: "one",
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => {
        const requestedPreset = background.hyperspeedPreset ?? "one";

        const presetKey = (
            requestedPreset in hyperspeedPresets
                ? requestedPreset
                : "one"
        ) as HyperspeedPresetKey;

        return <HyperspeedMount presetKey={presetKey} />;
    },
    supportsOverlay: true,
});