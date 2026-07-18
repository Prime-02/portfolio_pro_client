import { registerBackground } from "../../editor/BackgroundRegistry";
import Dither from "@/components/Dither";

registerBackground({
    type: "dither",
    label: "Dither",
    fields: [
        { kind: "slider", label: "Wave Speed", key: "ditherWaveSpeed", defaultValue: 0.05, min: 0, max: 1, step: 0.01 },
        { kind: "slider", label: "Frequency", key: "ditherWaveFrequency", defaultValue: 3, min: 0, max: 10, step: 0.1 },
        { kind: "slider", label: "Amplitude", key: "ditherWaveAmplitude", defaultValue: 0.3, min: 0, max: 2, step: 0.05 },
        { kind: "color", label: "Wave Color", key: "ditherWaveColor", defaultValue: "#5247f0" },
        { kind: "slider", label: "Color Count", key: "ditherColorNum", defaultValue: 4, min: 2, max: 16, step: 1 },
        { kind: "slider", label: "Pixel Size", key: "ditherPixelSize", defaultValue: 2, min: 1, max: 16, step: 1 },
        { kind: "checkbox", label: "Disable Animation", key: "ditherDisableAnimation", defaultValue: false },
        { kind: "checkbox", label: "Mouse Interaction", key: "ditherEnableMouseInteraction", defaultValue: true },
        { kind: "slider", label: "Mouse Radius", key: "ditherMouseRadius", defaultValue: 1, min: 0, max: 4, step: 0.1 },
    ],
    defaults: {
        type: "dither",
        ditherWaveSpeed: 0.05,
        ditherWaveFrequency: 3,
        ditherWaveAmplitude: 0.3,
        ditherWaveColor: "#5247f0",
        ditherColorNum: 4,
        ditherPixelSize: 2,
        ditherDisableAnimation: false,
        ditherEnableMouseInteraction: true,
        ditherMouseRadius: 1,
        overlayColor: "#000000",
        overlayOpacity: 0,
    },
    renderer: ({ background }) => {
        const color = background.ditherWaveColor || "#5247f0";
        const rgb = [
            parseInt(color.slice(1, 3), 16) / 255,
            parseInt(color.slice(3, 5), 16) / 255,
            parseInt(color.slice(5, 7), 16) / 255,
        ];
        return (
            <Dither
                waveSpeed={background.ditherWaveSpeed ?? 0.05}
                waveFrequency={background.ditherWaveFrequency ?? 3}
                waveAmplitude={background.ditherWaveAmplitude ?? 0.3}
                waveColor={rgb}
                colorNum={background.ditherColorNum ?? 4}
                pixelSize={background.ditherPixelSize ?? 2}
                disableAnimation={background.ditherDisableAnimation ?? false}
                enableMouseInteraction={background.ditherEnableMouseInteraction ?? true}
                mouseRadius={background.ditherMouseRadius ?? 1}
            />
        );
    },
    supportsOverlay: false,
});
