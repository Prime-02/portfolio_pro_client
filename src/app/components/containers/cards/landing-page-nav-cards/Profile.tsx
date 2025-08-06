import Button from "@/app/components/buttons/Buttons";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import {
  getColorShade,
  getImageSrc,
} from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import { ChevronRight, ChevronLeft } from "lucide-react";
import React, { useState } from "react";
import {
  FaPalette,
  FaQuestionCircle,
  FaCommentAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import ThemeSettings from "./profile-components/ThemeSettings";
import FeedBackComponent from "./profile-components/FeedBackComponent";
import HelpComponent from "./profile-components/HelpComponent";
import LogOutComponent from "./LogOutComponent";
import Link from "next/link";
import Image from "next/image";

const Profile = () => {
  const { userData, clerkUserData } = useGlobalState();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const tabs = [
    {
      name: "Theme",
      slug: "theme",
      icon: <FaPalette size={20} />,
    },
    {
      name: "Help & support",
      slug: "help",
      icon: <FaQuestionCircle size={20} />,
    },
    {
      name: "Give feedback or contribution",
      slug: "feedbacks",
      icon: <FaCommentAlt size={20} />,
    },
    {
      name: "Log out",
      slug: "log-out",
      icon: <FaSignOutAlt size={20} />,
    },
  ];

  const handleTabClick = (slug: string) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(slug);
      setIsTransitioning(false);
    }, 400);
  };

  const handleBackClick = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab("");
      setIsTransitioning(false);
    }, 400);
  };

  const getActiveTabName = () => {
    const tab = tabs.find((t) => t.slug === activeTab);
    return tab ? tab.name : "";
  };

  return (
    <div
      className="flex w-sm mx-auto rounded-xl overflow-hidden flex-col gap-y-5 p-2 relative"
      style={{
        backgroundColor: activeTab
          ? "var(--background)"
          : getColorShade(theme.background, 10),
      }}
    >
      {/* Main Content */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          activeTab || isTransitioning
            ? "transform -translate-x-full opacity-0"
            : "transform translate-x-0 opacity-100"
        }`}
        style={{
          position: activeTab ? "absolute" : "relative",
          width: "100%",
        }}
      >
        <div className="flex flex-col gap-y-3 p-3 rounded-2xl bg-[var(--background)] shadow-md">
          <div className="flex">
            <div className="flex items-center justify-start gap-x-5">
              <Image
                src={getImageSrc(String(userData?.profile_picture))}
                alt="Profile Picture"
                className="w-12 h-12 rounded-full object-cover"
                width={100}
                height={100}
              />
              <span className="flex flex-col">
                <h3 className="text-lg font-semibold">
                  {userData.username
                    ? userData.username
                    : clerkUserData.user?.id && !userData.username
                      ? "Your Porfile Is Incomplete"
                      : "Sign Up"}
                </h3>
                <span className="flex gap-x-2">
                  <p>{userData.firstname}</p>
                  <p>{userData.lastname}</p>
                </span>
              </span>
            </div>
          </div>
          <span className="w-[80%] mx-auto h-[0.5px] bg-[var(--foreground)]"></span>
          <Link
            href={`/${
              userData.username
                ? `${userData.username}/profile`
                : clerkUserData.user?.id && !userData.username
                  ? "welcome"
                  : "/user-auth?auth_mode=signup"
            }`}
            className="w-full flex"
          >
            <Button
              variant="outline"
              className="w-full"
              size="md"
              text={`${userData.username ? "View Your Profile" : "Set Up Your Profile"}`}
            />
          </Link>
        </div>

        <ul className="flex flex-col gap-y-3 mt-4">
          {tabs.map((tab, i) => (
            <li
              key={i}
              onClick={() => handleTabClick(tab.slug)}
              className="flex flex-row items-center hover:bg-[var(--background)] rounded-lg justify-between cursor-pointer"
            >
              <span className="flex items-center gap-x-4 justify-start">
                <span className="w-12 h-12 flex items-center justify-center transition duration-100 cursor-pointer rounded-full bg-[var(--background)]">
                  {tab.icon}
                </span>
                <h3 className="font-semibold">{tab.name}</h3>
              </span>
              <ChevronRight />
            </li>
          ))}
        </ul>
        <footer className="text-center text-xs text-gray-500">
          {"Click Outside to close"}
        </footer>
      </div>

      {/* Tab Content */}
      {activeTab && (
        <div
          className={`transition-all duration-500 ease-in-out ${
            isTransitioning
              ? "transform translate-x-full opacity-0"
              : "transform translate-x-0 opacity-100"
          }`}
        >
          <div className="flex items-center gap-4 mb-6">
            <span
              style={{
                backgroundColor: getColorShade(theme.background, 10),
              }}
              onClick={handleBackClick}
              className="w-12 h-12 flex items-center justify-center transition duration-100 cursor-pointer rounded-full bg-[var(--background)]"
            >
              <ChevronLeft size={20} />
            </span>
            <h2 className="text-xl font-bold">{getActiveTabName()}</h2>
          </div>

          <div
            className="p-4 rounded-2xl shadow-md auto"
            style={{
              backgroundColor: getColorShade(theme.background, 10),
            }}
          >
            {activeTab === "theme" && <ThemeSettings />}
            {activeTab === "feedbacks" && <FeedBackComponent />}
            {activeTab === "help" && <HelpComponent />}
            {activeTab === "log-out" && <LogOutComponent />}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
