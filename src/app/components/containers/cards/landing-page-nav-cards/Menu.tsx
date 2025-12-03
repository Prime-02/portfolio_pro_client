import { privateRoutes } from "@/app/components/utilities/indices/NavigationItems";
import { useGlobalState } from "@/app/globalStateProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

// Define your route categories
const routeCategories = {
  PROFILE: ["profile", "personal-info", "socials"],
  PROFESSIONAL: [
    "portfolios",
    "projects",
    "resume",
    "certification",
    "education",
    "skills",
  ],
  CONTENT: ["media-gallery", "testimonials", "posts"],
  SETTINGS: ["preference"],
};

const Menu = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const { userData } = useGlobalState();
  const pathname = usePathname();

  // Group routes by category
  const groupedRoutes = Object.entries(routeCategories).map(
    ([category, slugs]) => ({
      category,
      routes: privateRoutes.filter((route) => slugs.includes(route.slug)),
    })
  );

  const isActiveRoute = (routeLink: string) => {
    const basePath = `/${userData.username}/`;
    const fullRoutePath = `${basePath}${routeLink}`.replace(/\/+$/, "");
    const cleanPathname = pathname.replace(/\/+$/, "");
    return cleanPathname === fullRoutePath;
  };

  // Category title mapping
  const categoryTitles = {
    PROFILE: "Profile",
    PROFESSIONAL: "Professional",
    CONTENT: "Content",
    SETTINGS: "Settings",
  };

  return (
    <div className="overflow-y-auto">
      <div className="space-y-4">
        {groupedRoutes.map(({ category, routes }) => (
          <div key={category} className="space-y-3">
            {/* Category Header */}
            {isCollapsed && (
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-3">
                {categoryTitles[category as keyof typeof categoryTitles]}
              </h3>
            )}

            {/* Routes List */}
            <div className="space-y-1">
              {routes.map((route) => {
                const IconComponent = route.icon;
                const isActive = isActiveRoute(route.link);

                return (
                  <Link
                    key={route.slug}
                    href={`/${userData.username}${route.link}`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all justify-center duration-200 ${
                      isActive
                        ? `bg-[var(--accent)] text-[var(--accent)] border-r-2 border-[var(--accent)]`
                        : "hover:bg-[var(--background)]/10"
                    } mx-auto `}
                  >
                    <IconComponent
                      className={`${
                        isActive ? `text-[var(--accent)]` : ""
                      } mx-auto `}
                    />
                    {isCollapsed && (
                      <div className="flex-1 min-w-0"
                      title={route.description}
                      >
                        <span className="block text-sm font-medium truncate">
                          {route.name}
                        </span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
