"use client"; // Required for hooks
import OAuthButton from "../[platform]/platforms/OAuthButton";

const OAuth = () => {
  return (
      <div className="flex gap-2 w-full ">
        <span className="w-1/2">
          <OAuthButton fullWidth provider="google" />
        </span>
        <span className="w-1/2">
          <OAuthButton fullWidth provider="linkedin" />
        </span>
      </div>
  );
};

export default OAuth;
