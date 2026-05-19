"use client";
import Link from "next/link";
import PortfolioPro from "./components/logo/PortfolioProTextLogo";
import Button from "./components/buttons/Buttons";
import { ArrowRight } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui/useUIStore";
import { headlines } from "@/lib/utilities/indices/LandingPageTexts";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

export default function Home() {
  const { isLoading } = useUIStore();
  const { userInfo } = useUserSettings()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full max-w-4xl flex flex-col items-center text-center gap-8 sm:gap-12">
        <div className="flex flex-col items-center gap-4">
          <PortfolioPro
            tracking={0.2}
            scale={0.75}
            fontWeight={"extrabold"}
            reanimateDelay={3000}
          />

          <div className="flex flex-col gap-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold  leading-tight">
              {headlines.mainHeadline}
            </h1>
            <p className="text-lg sm:text-xl  max-w-2xl mx-auto">
              {headlines.subHeadLine}
            </p>
          </div>
        </div>
        {!userInfo?.id && (
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
        )}
        {userInfo?.id && (
          <Link href={`/${userInfo.username ? userInfo.username : "welcome"}`}>
            <Button
              variant="primary"
              size="md"
              type="button"
              colorIntensity="light"
              text={`${userInfo.username ? "Proceed To Dashboard" : "Get Started"}`}
              icon2={<ArrowRight />}
              disabled={isLoading("fetching_user_data")}
              title={isLoading("fetching_user_data") ? "Please wait..." : ""}
            />
          </Link>
        )}
      </main>
    </div>
  );
}
