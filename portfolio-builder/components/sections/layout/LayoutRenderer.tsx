// portfolio-builder/components/sections/layout/LayoutRenderer.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { LayoutData } from "@/portfolio-builder/types/layout";
import { Navbar, Footer, PageBackground } from "./renderer-components";
import { ScrollIndicator } from "../hero/renderer-components/ScrollIndicator";

interface LayoutRendererProps {
    data: LayoutData;
    children: React.ReactNode;
}

export default function LayoutRenderer({ data, children }: LayoutRendererProps) {
    const mainRef = useRef<HTMLElement>(null);
    const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);
    const scrollContainerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        // Walk up from <main> to find the nearest ancestor that actually
        // scrolls. html/body are locked to viewport height in this app
        // shell (see [ScrollDebug]), so the real scroll root is a wrapper
        // div (`.overflow-auto`) rendered above LayoutRenderer in
        // PortfolioStudio. We find it at runtime rather than threading a
        // ref down through PortfolioMain/PortfolioStudio.
        let el: HTMLElement | null = mainRef.current;
        let found: HTMLElement | null = null;
        while (el) {
            const style = getComputedStyle(el);
            const canScroll =
                el.scrollHeight > el.clientHeight &&
                (style.overflowY === "auto" || style.overflowY === "scroll");
            if (canScroll) {
                found = el;
                break;
            }
            el = el.parentElement;
        }
        scrollContainerRef.current = found;
        setScrollContainer(found);
    }, []);

    const hasFixedNavbar =
        data.navbar?.enabled &&
        (data.navbar.position === "fixed" || data.navbar.position === "absolute");

    return (
        <>
            {data.pageBackground && <PageBackground data={data.pageBackground} />}
            {data.navbar && <Navbar data={data.navbar} />}

            <main
                ref={mainRef}
                className="min-h-screen relative z-10"
                style={{
                    paddingTop: hasFixedNavbar ? (data.navbar?.paddingY ?? 16) * 2 + 24 : 0,
                }}
            >
                {children}
            </main>

            {scrollContainer && <ScrollIndicator containerRef={scrollContainerRef} />}

            {data.footer && <Footer data={data.footer} navbarData={data.navbar} />}
        </>
    );
}