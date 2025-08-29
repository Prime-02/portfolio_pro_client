import { useTheme } from "@/app/components/theme/ThemeContext ";
import Image from "next/image";
import React from "react";
import GitHubButton from "./GitHubButton";

const UnApproved = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className="w-full min-h-screen h-auto flex items-center justify-center">
      <div className="flex rounded-2xl items-center justify-center p-3 border border-[var(--accent)]/20 flex-col h-auto max-w-md min-w-sm">
        <div
          className={`object-cover rounded-full ${!isDarkMode ? "bg-white" : "bg-black"} w-32 h-32 `}
        >
          <Image
            src={`/socials/github/github-mark/github-mark${!isDarkMode ? "" : "-white"}.png`}
            width={1000}
            height={1000}
            alt="Git Hub Logo"
          />
        </div>
        <div className="flex flex-col items-center space-y-2 my-2">
            <p className="text-red-500 text-xs">
                Something went wrong
            </p>
          <GitHubButton />
          <div className="flex mx-auth items-center justify-between w-sm">
            <span className="w-[40%] h-[0.25px] bg-[var(--accent)]"></span>
            <span>or</span>
            <span className="w-[40%] h-[0.25px] bg-[var(--accent)]"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnApproved;
