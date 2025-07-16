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
import { Bell, ChevronDown } from "lucide-react";
import { BsFillGrid3X3GapFill } from "react-icons/bs";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import Button from "../../buttons/Buttons";
import Menu from "../../containers/cards/landing-page-nav-cards/Menu";
import Profile from "../../containers/cards/landing-page-nav-cards/Profile";
import Image from "next/image";

const LandingPageNavbar = () => {
  const { theme } = useTheme();
  const { userData } = useGlobalState();
  const [viewportWidth, setViewportWidth] = useState(0);
  const [mobileSearchOverlay, setMobileSearchOverlay] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setViewportWidth(window.innerWidth);
      if (viewportWidth) {
      }

      const handleResize = () => {
        setViewportWidth(window.innerWidth);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return (
    <div
      className="min-h-16 w-full h-auto  flex flex-row items-center justify-between py-3 px-4"
      style={{
        backgroundColor: getColorShade(theme.background, 10),
      }}
    >
      {/* Left section - Logo */}
      <div className="flex-shrink-0">
        <Link href={"/"} className="">
          <PortfolioProLogo scale={0.2} />
        </Link>
      </div>

      {/* Center section - Search (Enhanced width) */}
      <div className="flex-1 flex justify-center px-4 min-w-0">
        <div className="w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl">
          <AbsoluteSearch />
        </div>
      </div>

      {/* Right section - Auth/User controls */}
      <div className="flex-shrink-0 ml-4">
        <SignedOut>
          <div className="flex gap-x-2 lg:gap-x-3">
            <SignInButton>
              <Button variant="outline" size="md" text="Sign In" />
            </SignInButton>
            <SignUpButton>
              <Button variant="primary" size="md" text="Sign Up" />
            </SignUpButton>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="flex flex-row gap-x-2 lg:gap-x-4">
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
              href={`/${userData.username}/notifications`}
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
                      src={getImageSrc(String(userData?.profile_picture))}
                      alt="Profile Picture"
                      width={500}
                      height={500}
                      className="w-12 h-12 hover:scale-110 transition duration-100 cursor-pointer rounded-full"
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
          </div>
        </SignedIn>
      </div>
    </div>
  );
};

export default LandingPageNavbar;
