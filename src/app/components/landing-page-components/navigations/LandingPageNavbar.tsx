import React, { useEffect, useState } from "react";
import AbsoluteSearch from "../../containers/cards/AbsoluteSearch";
import {
  getColorShade,
  getImageSrc,
} from "../../utilities/syncFunctions/syncs";
import { useTheme } from "../../theme/ThemeContext ";
import { useGlobalState } from "@/app/globalStateProvider";
import PortfolioProLogo from "../../logo/PortfolioProLogo";
import Popover from "../../containers/divs/PopOver";
import { Bell, ChevronDown, Search, X } from "lucide-react";
import { BsFillGrid3X3GapFill } from "react-icons/bs";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Button from "../../buttons/Buttons";
import Menu from "../../containers/cards/landing-page-nav-cards/Menu";
import Profile from "../../containers/cards/landing-page-nav-cards/Profile";
import Image from "next/image";

const LandingPageNavbar = () => {
  const { theme } = useTheme();
  const { userData } = useGlobalState();
  const [viewportWidth, setViewportWidth] = useState(0);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { isSignedIn } = useAuth();

  const isMobile = viewportWidth < 768; // md breakpoint

  useEffect(() => {
    if (typeof window !== "undefined") {
      setViewportWidth(window.innerWidth);
      const handleResize = () => {
        setViewportWidth(window.innerWidth);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Close mobile search when viewport changes to desktop
  useEffect(() => {
    if (!isMobile && showMobileSearch) {
      setShowMobileSearch(false);
    }
  }, [isMobile, showMobileSearch]);

  return (
    <div
      className="min-h-16 w-full h-auto flex flex-row items-center justify-between px-4 md:px-8"
      style={{
        backgroundColor: getColorShade(theme.background, 10),
      }}
    >
      {/* Mobile Search Overlay - Only shown when signed in */}
      {isSignedIn && isMobile && showMobileSearch && (
        <div
          className="absolute top-0 left-0 right-0 z-50 p-4 flex items-center gap-2"
          style={{
            backgroundColor: getColorShade(theme.background, 10),
            minHeight: "4rem",
          }}
        >
          <div className="flex-1">
            <AbsoluteSearch />
          </div>
          <button
            onClick={() => setShowMobileSearch(false)}
            className="p-2 rounded-full hover:bg-opacity-80 transition-colors"
            title="Close search"
          >
            <X size={24} />
          </button>
        </div>
      )}

      {/* Left section - Logo and Search */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <PortfolioProLogo scale={0.2} />
        </Link>

        {/* Mobile Search Icon - Only visible on mobile and when signed in */}
        {isSignedIn && isMobile && (
          <button
            onClick={() => setShowMobileSearch(true)}
            className="cursor-pointer rounded-full w-12 h-12 flex items-center justify-center bg-[var(--background)]"
            title="Search"
          >
            <Search size={24} />
          </button>
        )}

        {/* Desktop Search - Hidden on mobile and when not signed in */}
        {isSignedIn && !isMobile && (
          <div className="min-w-0">
            <div className="w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl">
              <AbsoluteSearch />
            </div>
          </div>
        )}
      </div>

      {/* Right section - Auth/User controls */}
      <div className="flex-shrink-0 flex flex-row items-center gap-x-2 lg:gap-x-4">
        {isSignedIn ? (
          <>
            <span title="Menu">
              <Popover
                clicker={
                  <div>
                    <BsFillGrid3X3GapFill size={25} />
                  </div>
                }
                position="bottom-center"
              >
                <Menu />
              </Popover>
            </span>
            <Link
              title="Notification"
              href={`/${userData?.username}/notifications`}
              className="cursor-pointer rounded-full w-12 h-12 flex items-center justify-center bg-[var(--background)]"
            >
              <Bell />
            </Link>
            <Popover
              position="bottom-left"
              clicker={
                <div className="relative inline-block" title="Profile">
                  <span className="overflow-hidden rounded-full block">
                    <Image
                      src={getImageSrc(userData?.profile_picture || "")}
                      alt="Profile Picture"
                      width={500}
                      height={500}
                      className="w-12 h-12 hover:scale-110 transition object-cover duration-100 cursor-pointer rounded-full"
                    />
                  </span>
                  <ChevronDown
                    className="absolute -bottom-0.5 -right-1 z-20 bg-[var(--background)] rounded-full shadow-sm"
                    size={16}
                  />
                </div>
              }
            >
              <Profile />
            </Popover>
          </>
        ) : (
          <>
            <Link href="/user-auth?auth_mode=login">
              <Button variant="ghost" size="md" text="Sign in to console" />
            </Link>
            <Link href="/user-auth?auth_mode=signup">
              <Button variant="secondary" size="md" text="Sign Up" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default LandingPageNavbar;
