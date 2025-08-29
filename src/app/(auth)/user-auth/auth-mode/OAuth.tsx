"use client"; // Required for hooks
import GitHubButton from "../[platform]/platforms/github/GitHubButton";
import GioogleButton from "../[platform]/platforms/google/GoogleButton";
import LinkedInButton from "../[platform]/platforms/linkedIn/LinkedInButton";

const OAuth = () => {
  return (
    <div className="flex flex-col gap-2">
      <GioogleButton />
      <div className="flex gap-2">
        <span>
          <LinkedInButton />
        </span>
        <span>
          <GitHubButton />
        </span>
      </div>
    </div>
  );
};

export default OAuth;
