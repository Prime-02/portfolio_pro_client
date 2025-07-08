import { useTheme } from "@/app/components/theme/ThemeContext ";
import { privateRoutes } from "@/app/components/utilities/indices/NavigationItems";
import { getColorShade } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const ProfileSideBar = () => {
  const { theme, accentColor } = useTheme();
  const { userData } = useGlobalState();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActiveRoute = (routeLink: string) => {
    const routeWithUsername = `/${userData.username}${routeLink}`;
    const cleanRoutePath = routeWithUsername.replace(/\/+$/, "");
    const cleanPathname = pathname.replace(/\/+$/, "");
    return cleanPathname === cleanRoutePath;
  };

  return (
    <div
      className={`min-h-screen hidden md:flex h-auto z-10 left-0 flex-col border-r transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-64"
      }`}
      style={{
        backgroundColor: getColorShade(theme.background, 5),
        borderColor: `${theme.foreground}10`,
      }}
    >
      {/* Header with toggle button */}
      <div
        className="p-3 border-b transition-colors duration-300 ease-in-out"
        style={{ borderColor: `${theme.foreground}10` }}
      >
        <button
          onClick={toggleCollapse}
          className="p-2 rounded-lg flex items-center justify-center w-full transition-all duration-300 ease-in-out hover:bg-opacity-20 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-opacity-50 "
          style={{
            color: theme.foreground,
          }}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4">
        {/* Profile Section */}
        <div className="mb-4">
          <h3
            className={`text-xs font-semibold text-muted-foreground px-4 mb-2 ${isCollapsed ? "hidden" : "block"}`}
          >
            PROFILE
          </h3>
          {privateRoutes
            .filter((route) =>
              ["profile", "personal-info", "socials"].includes(route.slug)
            )
            .map((route, i) => (
              <Link
                key={i}
                href={`/${userData?.username || "user"}/${route.link}`}
                className="block"
              >
                <div
                  className={`mx-2 mb-2 p-3 rounded-lg transition-all duration-300 ease-in-out hover:bg-opacity-20 hover:bg-[var(--background)] text-foreground cursor-pointer group ${
                    isCollapsed
                      ? "flex items-center justify-center"
                      : "flex items-center gap-3"
                  }`}
                  style={{
                    color: isActiveRoute(route.link)
                      ? accentColor.color
                      : theme.foreground,
                    backgroundColor: isActiveRoute(route.link)
                      ? `${accentColor.color}20`
                      : "none",
                  }}
                >
                  <div className="flex-shrink-0">
                    <route.icon
                      size={20}
                      className="transition-transform duration-300 ease-in-out group-hover:scale-110"
                    />
                  </div>
                  {!isCollapsed && (
                    <span className="font-medium text-sm transition-opacity duration-300 ease-in-out">
                      {route.name}
                    </span>
                  )}
                </div>
              </Link>
            ))}
        </div>

        {/* Professional Section */}
        <div className="mb-4">
          <h3
            className={`text-xs font-semibold text-muted-foreground px-4 mb-2 ${isCollapsed ? "hidden" : "block"}`}
          >
            PROFESSIONAL
          </h3>
          {privateRoutes
            .filter((route) =>
              [
                "portfolios",
                "projects",
                "resume",
                "certification",
                "education",
                "skills",
              ].includes(route.slug)
            )
            .map((route, i) => (
              <Link
                key={i}
                href={`/${userData?.username || "user"}/${route.link}`}
                className="block"
              >
                <div
                  className={`mx-2 mb-2 p-3 rounded-lg transition-all duration-300 ease-in-out hover:bg-opacity-20 hover:bg-[var(--background)] text-foreground cursor-pointer group ${
                    isCollapsed
                      ? "flex items-center justify-center"
                      : "flex items-center gap-3"
                  }`}
                  style={{
                    color: isActiveRoute(route.link)
                      ? accentColor.color
                      : theme.foreground,
                    backgroundColor: isActiveRoute(route.link)
                      ? `${accentColor.color}20`
                      : "none",
                  }}
                >
                  <div className="flex-shrink-0">
                    <route.icon
                      size={20}
                      className="transition-transform duration-300 ease-in-out group-hover:scale-110"
                    />
                  </div>
                  {!isCollapsed && (
                    <span className="font-medium text-sm transition-opacity duration-300 ease-in-out">
                      {route.name}
                    </span>
                  )}
                </div>
              </Link>
            ))}
        </div>

        {/* Content Section */}
        <div className="mb-4">
          <h3
            className={`text-xs font-semibold text-muted-foreground px-4 mb-2 ${isCollapsed ? "hidden" : "block"}`}
          >
            CONTENT
          </h3>
          {privateRoutes
            .filter((route) =>
              ["media-gallery", "testimonials", "content-block"].includes(
                route.slug
              )
            )
            .map((route, i) => (
              <Link
                key={i}
                href={`/${userData?.username || "user"}/${route.link}`}
                className="block"
              >
                <div
                  className={`mx-2 mb-2 p-3 rounded-lg transition-all duration-300 ease-in-out hover:bg-opacity-20 hover:bg-[var(--background)] text-foreground cursor-pointer group ${
                    isCollapsed
                      ? "flex items-center justify-center"
                      : "flex items-center gap-3"
                  }`}
                  style={{
                    color: isActiveRoute(route.link)
                      ? accentColor.color
                      : theme.foreground,
                    backgroundColor: isActiveRoute(route.link)
                      ? `${accentColor.color}20`
                      : "none",
                  }}
                >
                  <div className="flex-shrink-0">
                    <route.icon
                      size={20}
                      className="transition-transform duration-300 ease-in-out group-hover:scale-110"
                    />
                  </div>
                  {!isCollapsed && (
                    <span className="font-medium text-sm transition-opacity duration-300 ease-in-out">
                      {route.name}
                    </span>
                  )}
                </div>
              </Link>
            ))}
        </div>

        {/* Settings Section */}
        <div>
          <h3
            className={`text-xs font-semibold text-muted-foreground px-4 mb-2 ${isCollapsed ? "hidden" : "block"}`}
          >
            SETTINGS
          </h3>
          {privateRoutes
            .filter((route) => ["preference"].includes(route.slug))
            .map((route, i) => (
              <Link
                key={i}
                href={`/${userData?.username || "user"}/${route.link}`}
                className="block"
              >
                <div
                  className={`mx-2 mb-2 p-3 rounded-lg transition-all duration-300 ease-in-out hover:bg-opacity-20 hover:bg-[var(--background)] text-foreground cursor-pointer group ${
                    isCollapsed
                      ? "flex items-center justify-center"
                      : "flex items-center gap-3"
                  }`}
                  style={{
                    color: isActiveRoute(route.link)
                      ? accentColor.color
                      : theme.foreground,
                    backgroundColor: isActiveRoute(route.link)
                      ? `${accentColor.color}20`
                      : "none",
                  }}
                >
                  <div className="flex-shrink-0">
                    <route.icon
                      size={20}
                      className="transition-transform duration-300 ease-in-out group-hover:scale-110"
                    />
                  </div>
                  {!isCollapsed && (
                    <span className="font-medium text-sm transition-opacity duration-300 ease-in-out">
                      {route.name}
                    </span>
                  )}
                </div>
              </Link>
            ))}
        </div>
      </div>
      {/* Footer spacer */}
      <div className="p-4">
        {!isCollapsed && (
          <div
            className="text-xs opacity-60 text-center transition-opacity duration-300 ease-in-out"
            style={{ color: theme.foreground }}
          >
            Profile Menu
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSideBar;
