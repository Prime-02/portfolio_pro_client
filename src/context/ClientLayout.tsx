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
    <main className="min-w-sm flex">
      {!shouldHideNavbar && <LandingPageNavbar />}

      {/* Render the page content */}
      <div
        className={`w-full max-h-screen h-screen overflow-auto custom-scrollbar ${!shouldHideNavbar && isMobile ? "" : ""
          }`}
      >
        {children}
      </div>
    </main>
  );
}