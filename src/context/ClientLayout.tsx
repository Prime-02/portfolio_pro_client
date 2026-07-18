"use client";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import LandingPageNavbar from "../app/components/landing-page-components/navigations/LandingPageNavbar";
import { useUIStore } from "@/lib/stores/ui/useUIStore";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { viewportWidth } = useUIStore();
  const pathname = usePathname(); // Current route path

  // Check if the current path is one of the routes where navbar should be HIDDEN
  const shouldHideNavbar = [
    "/user-auth",
    "/studio",
    "/portfolios/"
  ].some(route => pathname?.includes(route));

  const isMobile = viewportWidth < 768;

  return (
    <main className="min-w-sm flex relative">
      {/* Animated gradient background blob */}
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="animated-gradient absolute -top-1/2 -left-1/2 w-[200%] h-[200%]"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, var(--accent), transparent 40%),
              radial-gradient(circle at 70% 70%, var(--foreground), transparent 40%)
            `,
            opacity: 0.08,
          }}
        />
      </div>

      {!shouldHideNavbar && <LandingPageNavbar />}

      {/* Render the page content */}
      <div
        className={`w-full max-h-screen h-screen overflow-auto custom-scrollbar pt-16 relative z-10 ${!shouldHideNavbar && isMobile ? "" : ""
          }`}
      >
        {children}
      </div>
    </main>
  );
}