import ImageCard from "@/app/components/containers/cards/ImageCard";
import CheckBox from "@/app/components/inputs/CheckBox";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { AllProjectsDisplayCardProps } from "@/app/components/types and interfaces/ProjectsAndPortfolios";
import { filterPlatform } from "@/app/components/utilities/indices/projects-JSONs/projectCreate";
import {
  formatDateString,
  getImageSrc,
  replaceCharacters,
} from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import { useProjectsStore } from "@/app/stores/project_stores/ProjectsStore";
import { Heart, MessageSquare } from "lucide-react";
import Image from "next/image";
import React from "react";

const AllProjectsCard = (prop: AllProjectsDisplayCardProps) => {
  const { checkParams, viewportWidth, extendRoute } = useGlobalState();
  const { theme, isDarkMode } = useTheme();
  const { toggleProjectName, projectsNames } = useProjectsStore();

  // Force grid view on small screens (< 640px), otherwise use URL parameter
  const urlView = checkParams("view") || "grid";
  const view = viewportWidth < 640 ? "grid" : urlView;
  const isListView = view === "list";
  const isSelected = projectsNames.includes(prop.id);

  const platformLogoData = filterPlatform(prop.project_platform);
  const getLogoSrc = () => {
    if (!platformLogoData) return "";

    if (typeof platformLogoData.logoSrc === "function") {
      return platformLogoData.logoSrc(isDarkMode);
    }

    return platformLogoData.logoSrc;
  };

  return (
    <div
      onClick={() => {
        extendRoute(prop.id);
      }}
      className={`
        group relative cursor-pointer
        border transition-all duration-300 ease-in-out rounded-xl
        ${
          isSelected
            ? "border-[var(--accent)] shadow-lg scale-[1.02] ring-2 ring-[var(--accent)]/20"
            : "border-[var(--accent)]/20 hover:border-[var(--accent)]/40"
        }
        "hover:shadow-xl hover:transform hover:scale-[1.01] shadow-md
        flex overflow-hidden
        ${isListView ? "flex-row gap-0 items-center" : "flex-col gap-0 "}
       h-auto`}
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >

      {/* Image Section */}
      <div
        className={`relative overflow-hidden ${isListView ? "w- h-full flex-shrink-0" : "w-full h-48"}`}
      >
        <ImageCard
          borderRadius={isListView ? "none" : "xl"}
          shadow="none"
          borderColor="transparent"
          image_url={prop.project_image_url}
          id={prop.id}
          aspectRatio="1/1"
        />

        {/* Overlay on hover */}
        <div
          className={`
          absolute inset-0 bg-black/20 transition-opacity duration-300
          hover:opacity-100 opacity-0
        `}
        />

        {/* Status Badges - Improved positioning and styling */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 max-w-[calc(100%-24px)]">
          {prop.likes.length > 0 && (
            <span className="px-2 py-1 gap-x-1.5 flex items-center font-semibold rounded-full bg-red-500/90 text-white backdrop-blur-md shadow-lg border border-white/20 transition-transform hover:scale-105">
              <Heart size={14} fill="currentColor" />
              <span className="text-xs">{prop.likes.length}</span>
            </span>
          )}
          {prop.comments.length > 0 && (
            <span className="px-2 py-1 gap-x-1.5 flex items-center font-semibold rounded-full bg-blue-500/90 text-white backdrop-blur-md shadow-lg border border-white/20 transition-transform hover:scale-105">
              <MessageSquare size={14} />
              <span className="text-xs">{prop.comments.length}</span>
            </span>
          )}
        </div>

        {/* Platform indicator */}
        <div className="absolute bottom-3 right-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm border"
            style={{
              backgroundColor: `${theme.background}`,
              borderColor: "var(--accent)",
            }}
          >
            <Image
              src={getImageSrc(getLogoSrc(), prop.project_platform)}
              alt={platformLogoData?.logoAlt || ""}
              className="w-4 h-4 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.nextElementSibling?.classList.remove("hidden");
              }}
              width={16}
              height={16}
            />
            <div
              className="w-4 h-4 rounded flex items-center justify-center text-xs font-bold hidden"
              style={{
                backgroundColor: "var(--foreground)",
                color: "var(--background)",
              }}
            >
              {prop.project_platform.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div
        className={`flex flex-col p-6 gap-2 ${isListView ? "flex-1 justify-between" : ""}`}
      >
        {/* Header */}
        <h1
          className={`font-bold capitalize transition-colors duration-200 hover:text-[var(--accent)]
              } ${isListView ? "text-lg line-clamp-2" : "text-xl line-clamp-2"}`}
        >
          {replaceCharacters(["-", "_"], [" ", " "], prop.project_name)}
        </h1>

        {prop.tags && prop.tags.length > 0 && (
          <div className="flex items-center gap-x-1 flex-wrap">
            {prop.tags.map((tag, i) => (
              <p key={i} className="text-xs opacity-65">
                #{tag}
              </p>
            ))}
          </div>
        )}

        {/* Tech Stack - Simplified */}
        {prop.stack && prop.stack.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {prop.stack.slice(0, isListView ? 2 : 3).map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full border"
                style={{
                  borderColor: "var(--accent)",
                  color: "var(--accent)",
                  backgroundColor: `${theme.foreground}05`,
                }}
              >
                {tech}
              </span>
            ))}
            {prop.stack.length > (isListView ? 2 : 3) && (
              <span
                className="px-2 py-1 text-xs rounded-full border opacity-60"
                style={{
                  borderColor: "var(--accent)",
                  color: "var(--accent)",
                  backgroundColor: `${theme.foreground}05`,
                }}
              >
                +{prop.stack.length - (isListView ? 2 : 3)}
              </span>
            )}
          </div>
        )}
        {prop.created_at && (
          <span className="text-xs opacity-50">
            {formatDateString(prop.created_at, {
              includeTime: false,
              dateStyle: "long",
              locale: "en-US",
              useProximity: false,
              capitalizeFirst: true,
            })}
          </span>
        )}

        {/* Footer - Simplified */}
        <div
          className={`transition-transform duration-200 hover:translate-x-1 absolute w-fit bottom-2 right-2 flex`}
        >
          {prop.user_associations.slice(0, 6).map((collab, i) => (
            <Image
              width={100}
              height={100}
              src={getImageSrc(
                collab.user?.profile_picture,
                collab.user?.username
              )}
              key={i}
              className="w-10 h-10 rounded-full object-cover relative border"
              style={{
                zIndex: prop.user_associations.length - i, // Higher z-index for earlier avatars
                marginLeft: i > 0 ? "-20px" : "0", // Overlap avatars (adjust as needed)
              }}
              alt={`Avatar ${i + 1}`}
            />
          ))}
        </div>
      </div>
      <span
        className="absolute top-2 right-0 z-40"
        onClick={(e) => e.stopPropagation()}
      >
        <CheckBox
          isChecked={projectsNames.includes(prop.id)}
          setIsChecked={() => {
            toggleProjectName(prop.id);
          }}
        />
      </span>
    </div>
  );
};

export default AllProjectsCard;
