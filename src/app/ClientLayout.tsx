"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import LandingPageFooter from "./components/landing-page-components/footers/LandingPageFooter";
import LandingPageNavbar from "./components/landing-page-components/navigations/LandingPageNavbar";
interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname(); // Current route path
  // Check if the current path is one of the allowed routes
  const shouldShowNavbarAndFooter = [
    // "/",
    // "/portfolios",
    // "/projects",
    // "/terms_of_services",
    // "/features",
    // "/faq",
    ""
  ].includes(pathname || "");

  return (
    <main className="min-h-screen">
      {/* Only render Navbar and Footer if on allowed paths */}
      {!shouldShowNavbarAndFooter && <LandingPageNavbar />}

      {/* Render the page content */}
      <div className="w-full min-h-screen overflow-auto">{children}</div>

      {!shouldShowNavbarAndFooter && <LandingPageFooter />}
    </main>
  );
}
