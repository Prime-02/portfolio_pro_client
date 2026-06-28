// portfolio-builder/components/sections/hero/renderer-components/ParticlesBackground.tsx

"use client";

import { useRef, useEffect, useCallback } from "react";

interface ParticlesBackgroundProps {
    color: string;
    count: number;
    size: number;
    speed: number;
    opacity: number;
    lines: boolean;
    lineDist: number;
    bgColor: string;
    /** Overlay color as hex (e.g. "#000000") — composited on canvas so lines aren't covered */
    overlayColor?: string;
    /** Overlay opacity 0–100 */
    overlayOpacity?: number;
}

export function ParticlesBackground({
    color,
    count,
    size,
    speed,
    opacity,
    lines,
    lineDist,
    bgColor,
    overlayColor = "#000000",
    overlayOpacity = 0,
}: ParticlesBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);

    const hexToRgb = useCallback((hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return isNaN(r) ? "255,255,255" : `${r},${g},${b}`;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let W = canvas.offsetWidth || canvas.parentElement?.offsetWidth || 800;
        let H = canvas.offsetHeight || canvas.parentElement?.offsetHeight || 600;
        canvas.width = W;
        canvas.height = H;

        const rgb = hexToRgb(color);
        const bgRgb = hexToRgb(bgColor);
        const overlayRgb = hexToRgb(overlayColor);
        const overlayAlpha = Math.min(1, Math.max(0, overlayOpacity / 100));

        type Particle = { x: number; y: number; vx: number; vy: number };
        const particles: Particle[] = Array.from({ length: count }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * speed,
            vy: (Math.random() - 0.5) * speed,
        }));

        const draw = () => {
            // 1. Background fill
            ctx.fillStyle = `rgb(${bgRgb})`;
            ctx.fillRect(0, 0, W, H);

            // 2. Particles
            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > W) p.vx *= -1;
                if (p.y < 0 || p.y > H) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${rgb},${opacity})`;
                ctx.fill();
            }

            // 3. Connection lines
            if (lines) {
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < lineDist) {
                            const lineOpacity = (1 - dist / lineDist) * opacity * 0.5;
                            ctx.beginPath();
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.strokeStyle = `rgba(${rgb},${lineOpacity})`;
                            ctx.lineWidth = 0.6;
                            ctx.stroke();
                        }
                    }
                }
            }

            // 4. Overlay — drawn last so it tints everything uniformly
            //    Composited on canvas so it never sits above the lines in DOM z-order
            if (overlayAlpha > 0) {
                ctx.fillStyle = `rgba(${overlayRgb},${overlayAlpha})`;
                ctx.fillRect(0, 0, W, H);
            }

            animRef.current = requestAnimationFrame(draw);
        };

        draw();

        const onResize = () => {
            W = canvas.offsetWidth || canvas.parentElement?.offsetWidth || 800;
            H = canvas.offsetHeight || canvas.parentElement?.offsetHeight || 600;
            canvas.width = W;
            canvas.height = H;
        };
        window.addEventListener("resize", onResize);

        return () => {
            cancelAnimationFrame(animRef.current);
            window.removeEventListener("resize", onResize);
        };
    }, [color, count, size, speed, opacity, lines, lineDist, bgColor, overlayColor, overlayOpacity, hexToRgb]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full z-0"
            style={{ display: "block" }}
        />
    );
}