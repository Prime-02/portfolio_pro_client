"use client";
import Link from "next/link";
import PortfolioPro from "./components/logo/PortfolioProTextLogo";
import { headlines } from "./components/utilities/indices/LandingPageTexts";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Button from "./components/buttons/Buttons";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full max-w-4xl flex flex-col items-center text-center gap-8 sm:gap-12">
        <div className="flex flex-col items-center gap-4">
          <PortfolioPro />

          <div className="flex flex-col gap-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold  leading-tight">
              {headlines.mainHeadline}
            </h1>
            <p className="text-lg sm:text-xl  max-w-2xl mx-auto">
              {headlines.subHeadLine}
            </p>
          </div>
        </div>
        <SignedOut>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/user-auth?auth_mode=signup">
              <Button
                variant="primary"
                size="md"
                type="button"
                colorIntensity="dark"
                text="Start Building Your Portfolio"
              />
            </Link>
            <Link href="/features">
              <Button
                variant="outline"
                size="md"
                type="button"
                colorIntensity="light"
                text="Learn More"
                icon={<ArrowRight />}
              />
            </Link>
          </div>
        </SignedOut>
        <SignedIn>
          <Button
            variant="primary"
            size="md"
            type="button"
            colorIntensity="light"
            text="Proceed To Dashboard"
            icon={<ArrowRight />}
          />
        </SignedIn>
      </main>
    </div>
  );
}
