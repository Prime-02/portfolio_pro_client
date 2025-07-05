import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import React from "react";
import PortfolioProLogo from "../../logo/PortfolioProLogo";
import Button from "../../buttons/Buttons";
import { ArrowRight } from "lucide-react";
import { landingPageNavItems } from "../../utilities/indices/NavigationItems";
import Link from "next/link";

const LandingPageNavbar = () => {
  return (
    <nav className="flex justify-between items-center backdrop-blur-3xl fixed border-b  w-full p-4 gap-4 h-20">
      <div>
        {/* <PortfolioPro  scale={0.2} speed={0.5}/> */}
        <span className="scale-50">
          <PortfolioProLogo scale={0.23} />
        </span>
      </div>
      <div>
        {landingPageNavItems.map((link, i) => (
          <Link key={i} href={link.link}>
            <span>{link.name}</span>
          </Link>
        ))}
      </div>
      <div>
        <SignedOut>
          <Button
            variant="outline"
            size="md"
            colorIntensity="dark"
            text="Proceed To Dashboard"
            icon={<ArrowRight />}
          />
        </SignedOut>
        <SignedIn>
          <SignInButton />
          <SignUpButton />
        </SignedIn>
      </div>
    </nav>
  );
};

export default LandingPageNavbar;
