import React, { useEffect, useState } from "react";
import PortfolioProLogo from "../../logo/PortfolioProLogo";
import Popover from "../../containers/divs/PopOver";
import { ChevronDown, DownloadIcon, User } from "lucide-react";
import Link from "next/link";
import Button from "../../buttons/Buttons";
import Menu from "../../containers/cards/landing-page-nav-cards/Menu";
import Profile from "../../containers/cards/landing-page-nav-cards/Profile";
import Image from "@/src/app/components/ui/Image";
import NotificationsButton from "../../buttons/NotificationsButton";
import { useUIStore } from "@/lib/stores/ui/useUIStore";
import { getImageSrc } from "@/lib/utilities/syncFunctions/syncs";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { usePWA } from "@/lib/hooks/pwa/usePWA";
import { SubscriptionTier } from "@/lib/stores/billing/payment-types";
import MenuIcon from "../../svgs/MenuIcon";
import { useTheme } from "@/src/context/ThemeContext";

const LandingPageNavbar = () => {
  const { userInfo } = useUserSettings();
  const {
    viewportWidth,
    setViewportWidth,
    mobileMenuOpen,
    toggleMobileMenu,
    isSidebarExpanded,
    setSidebarExpanded,
  } = useUIStore();
  const { accentColor } = useTheme();

  const [imageError, setImageError] = useState(false);

  // Use the custom PWA hook
  const { isInstalled: isPWAInstalled } = usePWA();

  const handleImageError = () => {
    setImageError(true);
  };
  const fallbackLetter = userInfo?.username?.toUpperCase() || "User";

  const isMobile = viewportWidth < 768;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setViewportWidth(window.innerWidth);
      const handleResize = () => {
        setViewportWidth(window.innerWidth);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [setViewportWidth]);

  // Handle hover expand on desktop only
  const handleMouseEnter = () => {
    if (!isMobile) {
      setSidebarExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setSidebarExpanded(false);
    }
  };

  return (
    <>
      {/* Mobile Top Bar - CORRECTED */}
      {isMobile && (
        <div className="fixed top-0 right-0 z-30 p-3">
          <MenuIcon
            isOpen={mobileMenuOpen}
            onToggle={(isOpen) => toggleMobileMenu(isOpen)}
            color={accentColor.color}
          />
        </div>
      )}

      {/* Sidebar - Desktop or Mobile when open */}
      <div
        className={`
          ${isMobile ? "fixed" : "relative"} top-0 z-50 h-screen max-h-screen overflow-auto bg-[var(--background)] border-r border-[var(--accent)]/20 flex flex-col transition-all duration-300 ease-in-out
          ${isMobile ? `${mobileMenuOpen ? "left-0" : "-left-full"}` : ""}
          ${isSidebarExpanded || mobileMenuOpen ? "w-64" : "w-16"}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Top section - Logo and Search */}
        <div
          className={`items-center flex flex-col gap-2 py-4 ${isSidebarExpanded || mobileMenuOpen ? "px-4" : ""}`}
        >
          <Link
            className={`${isSidebarExpanded ? "w-full flex items-center justify-between " : "mx-auto"}`}
            href="/feed"
          >
            <PortfolioProLogo
              variant={mobileMenuOpen || isSidebarExpanded ? "banner" : "logo"}
              scale={!(mobileMenuOpen || isSidebarExpanded) ? 0.25 : 0.4}
            />
          </Link>
        </div>

        {/* Bottom section - Auth/User controls with horizontal padding */}
        <div className="flex-1 flex flex-col overflow-y-auto px-1">
          {userInfo?.id ? (
            <div className="flex flex-col h-full">
              {/* Menu takes majority of space */}
              <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
                <Menu setIsCollapsed={toggleMobileMenu} isCollapsed={isSidebarExpanded || mobileMenuOpen} />
              </div>

              {/* Fixed bottom controls */}
              <div className="flex flex-col gap-2 py-4 border-t border-[var(--accent)]/20">
                {/* Notification Link */}
                <Link
                  title="Notification"
                  href={`/${userInfo?.username}/notifications`}
                  className={`cursor-pointer rounded-full flex items-center transition-all duration-300 hover:bg-[var(--accent)]/10 ${isSidebarExpanded || mobileMenuOpen
                    ? "w-full px-4 py-3 justify-start gap-3"
                    : "w-12 h-12 justify-center mx-auto"
                    }`}
                >
                  <NotificationsButton
                    expanded={isSidebarExpanded || mobileMenuOpen}
                  />
                </Link>

                {/* Install App Link - Only show if not already installed */}
                {!isPWAInstalled && (
                  <Link
                    title="Install App"
                    href={`/install-app`}
                    className={`cursor-pointer rounded-full flex items-center transition-all duration-300 hover:bg-[var(--accent)]/10 ${isSidebarExpanded || mobileMenuOpen
                      ? "w-full px-4 py-3 justify-start gap-3"
                      : "w-12 h-12 justify-center mx-auto"
                      }`}
                  >
                    <DownloadIcon />
                    {(isSidebarExpanded || mobileMenuOpen) && (
                      <p>Get the app</p>
                    )}
                  </Link>
                )}

                {/* Profile Popover */}
                <Popover
                  className=""
                  clickerClassName=""
                  clickerContainerClassName=""
                  position="top-left"
                  clicker={
                    <div
                      className={`relative flex items-center cursor-pointer rounded-full transition-all duration-300 hover:bg-[var(--accent)]/10 ${isSidebarExpanded || mobileMenuOpen
                        ? "w-full px-4 py-3 justify-start gap-3"
                        : "w-12 h-12 justify-center mx-auto"
                        }`}
                      title="Profile"
                      aria-label="User Profile"
                    >
                      <span className="relative flex h-10 w-10 items-center justify-center object-cover rounded-full overflow-hidden flex-shrink-0">
                        {imageError ? (
                          <Image
                            src={`https://avatar.oxro.io/avatar.svg?name=${fallbackLetter}`}
                            alt={`${userInfo?.username || "User"}'s Profile Picture`}
                            width={100}
                            height={100}
                            className="h-full w-full"
                            onError={handleImageError}
                            loading="lazy"
                          />
                        ) : (
                          <Image
                            src={getImageSrc(
                              userInfo?.profile_picture,
                              userInfo?.username ?? ""
                            )}
                            alt={`${userInfo?.username || "User"}'s Profile Picture`}
                            width={100}
                            height={100}
                            className="h-full w-full"
                            onError={handleImageError}
                            loading="lazy"
                          />
                        )}
                      </span>
                      {(isSidebarExpanded || mobileMenuOpen) && (
                        <span className="flex flex-col items-start ">
                          <p className="font-semibold">{userInfo?.username}</p>
                          <p className="text-xs opacity-65 capitalize">
                            {userInfo.subscription_tier || SubscriptionTier.FREE}
                          </p>
                        </span>
                      )}
                      <ChevronDown
                        className={`rounded-full bg-[var(--background)] p-0.5 shadow-sm ${isSidebarExpanded || mobileMenuOpen
                          ? "absolute bottom-6 right-5"
                          : "absolute -bottom-0.5 -right-1"
                          }`}
                        size={16}
                        aria-hidden="true"
                      />
                    </div>
                  }
                >
                  <Profile />
                </Popover>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center gap-3">
              {isSidebarExpanded || mobileMenuOpen ? (
                <>
                  <Link
                    href="/user-auth?auth_mode=login"
                    className="w-full px-4"
                  >
                    <Button
                      variant="ghost"
                      size="md"
                      text="Sign in to console"
                    />
                  </Link>
                  <Link
                    href="/user-auth?auth_mode=signup"
                    className="w-full px-4"
                  >
                    <Button variant="secondary" size="md" text="Sign Up" />
                  </Link>
                </>
              ) : (
                <Link
                  href="/user-auth?auth_mode=login"
                  className="cursor-pointer rounded-full border w-12 h-12 flex items-center justify-center hover:bg-[var(--accent)]/10 transition-colors"
                  title="Sign In"
                >
                  <User size={24} />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay when menu is open */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => toggleMobileMenu(false)}
        />
      )}
    </>
  );
};

export default LandingPageNavbar;