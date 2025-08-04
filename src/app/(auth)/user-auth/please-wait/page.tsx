import PortfolioProLogo from "@/app/components/logo/PortfolioProTextLogo";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function Page() {
  // Handle the redirect flow by calling the Clerk.handleRedirectCallback() method
  // or rendering the prebuilt <AuthenticateWithRedirectCallback/> component.
  // This is the final step in the custom OAuth flow.
  return (
    <>
      <div className="flex items-center justify-center w-full h-screen">
        <div
          id="clerk-captcha"
          className="mb-4 h-auto flex items-center justify-center"
        >
          {/* Clerk will inject captcha here */}
        </div>
        <div className="h-auto mx-auto flex flex-col items-center">
          <div>
            <PortfolioProLogo
            tracking={0.2}
            scale={0.75}
            fontWeight={"extrabold"}
            reanimateDelay={3000}
          />
          </div>
          <p className="font-semibold">
            {"Please wait... we are validating your credentials  "}
          </p>
        </div>
      </div>
      <AuthenticateWithRedirectCallback />;
    </>
  );
}
