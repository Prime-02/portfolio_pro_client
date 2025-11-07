"use client";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import LandingPageNavbar from "./components/landing-page-components/navigations/LandingPageNavbar";
import { useGlobalState } from "./globalStateProvider";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { viewportWidth } = useGlobalState();
  const pathname = usePathname(); // Current route path
  
  // Check if the current path is one of the allowed routes
  const shouldShowNavbarAndFooter = [
    // "/",
    // "/portfolios",
    // "/projects",
    // "/terms_of_services",
    "/user-auth",
    "/welcome",
    "",
  ].includes(pathname || "");

  const isMobile = viewportWidth < 768;

  return (
    <main className="min-w-sm flex">
      {!shouldShowNavbarAndFooter && <LandingPageNavbar />}

      {/* Render the page content */}
      <div
        className={`w-full overflow-auto ${
          !shouldShowNavbarAndFooter && isMobile ? "pt-16" : ""
        }`}
      >
        {children}
      </div>
    </main>
  );
}