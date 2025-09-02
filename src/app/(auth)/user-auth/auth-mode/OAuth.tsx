"use client"; // Required for hooks
import OAuthButton from "../[platform]/platforms/OAuthButton";
import VercelButton from "../[platform]/platforms/vercel/VercelButton";

const OAuth = () => {
  return (
    <div className="flex flex-col gap-2 w-full ">
      <OAuthButton fullWidth provider="google"  />
      <div className="flex gap-2 w-full ">
        <span className="w-1/2">
          <OAuthButton fullWidth provider="linkedin" />
        </span>
        <span className="w-1/2">
          <OAuthButton fullWidth provider="github" />
        </span>
      </div>
      <OAuthButton fullWidth provider="canva"  />
      <div className="flex gap-2">
        <span className="w-1/2">
          <OAuthButton fullWidth provider="figma" />
        </span>
        <span className="w-1/2">
          <VercelButton />
        </span>
      </div>
    </div>
  );
};

export default OAuth;
