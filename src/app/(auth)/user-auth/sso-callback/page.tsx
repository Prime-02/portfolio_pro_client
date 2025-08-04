import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function Page() {
  // Handle the redirect flow by calling the Clerk.handleRedirectCallback() method
  // or rendering the prebuilt <AuthenticateWithRedirectCallback/> component.
  // This is the final step in the custom OAuth flow.
  return (
    <>
      <div
        id="clerk-captcha"
        className="mb-4 h-64 flex items-center justify-center"
      >
        {/* Clerk will inject captcha here */}
      </div>
      <AuthenticateWithRedirectCallback />;
    </>
  );
}
