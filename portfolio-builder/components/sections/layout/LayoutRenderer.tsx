// portfolio-builder/components/sections/layout/LayoutRenderer.tsx

"use client";

import { LayoutData } from "@/portfolio-builder/types/layout";
import { Navbar, Footer, PageBackground } from "./renderer-components";

interface LayoutRendererProps {
    data: LayoutData;
    children: React.ReactNode;
}

export default function LayoutRenderer({ data, children }: LayoutRendererProps) {
    const hasFixedNavbar =
        data.navbar?.enabled &&
        (data.navbar.position === "fixed" || data.navbar.position === "absolute");

    return (
        <>
            {/* Page-level background — lowest layer, fixed behind everything */}
            {data.pageBackground && <PageBackground data={data.pageBackground} />}

            {/* Fixed/absolute navbars render outside the flow */}
            {data.navbar && <Navbar data={data.navbar} />}

            {/* Main content — push down if navbar is fixed, allow natural scroll */}
            <main
                className="min-h-screen relative z-10"
                style={{
                    paddingTop: hasFixedNavbar ? (data.navbar?.paddingY ?? 16) * 2 + 24 : 0,
                }}
            >
                {children}
            </main>

            {/* Footer */}
            {data.footer && <Footer data={data.footer} navbarData={data.navbar} />}


        </>
    );
}