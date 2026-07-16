import { useUIStore } from "@/lib/stores/ui/useUIStore";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { privateRoutes } from "@/lib/utilities/indices/NavigationItems";
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
    "experience",
    "certification",
    "education",
    "skills",
  ],
  CONTENT: ["testimonials", "blogs"],
  SETTINGS: ["preference", "account-settings", 'session-management'],
};

const Menu = ({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean, setIsCollapsed: (isCollapsed: boolean) => void }) => {
  const { userInfo } = useUserSettings();
  const { isMobile } = useUIStore()
  const pathname = usePathname();

  // Group routes by category
  const groupedRoutes = Object.entries(routeCategories).map(
    ([category, slugs]) => ({
      category,
      routes: privateRoutes.filter((route) => slugs.includes(route.slug)),
    })
  );

  const isActiveRoute = (routeLink: string, routeSlug: string) => {
    const basePath = `/${userInfo?.username ?? "user"}`;
    const cleanPathname = pathname.replace(/\/+$/, "");

    // Check the actual link path
    const linkPath = `${basePath}${routeLink}`.replace(/\/+$/, "");

    // Also check by slug as a fallback
    const slugPath = `${basePath}/${routeSlug}`.replace(/\/+$/, "");

    return cleanPathname === linkPath || cleanPathname === slugPath;
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
              <h3 className="text-sm font-semibold uppercase tracking-wider opacity-60 px-3">
                {categoryTitles[category as keyof typeof categoryTitles]}
              </h3>
            )}

            {/* Routes List */}
            <div className="space-y-1">
              {routes.map((route) => {
                const IconComponent = route.icon;
                const isActive = isActiveRoute(route.link, route.slug);

                return (
                  <Link
                    key={route.slug}
                    href={`/${userInfo?.username ?? "user"}${route.link}`}
                    onClick={() => {
                      if (isMobile) {
                        setIsCollapsed(false)
                      }
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all justify-center duration-200 ${isActive
                      ? `bg-[var(--accent)] text-[var(--foreground)] border-r-2 border-[var(--accent)]`
                      : "hover:bg-[var(--background)]/10"
                      } mx-auto `}
                  >
                    <IconComponent
                      className={`${isActive ? `text-[var(--foreground)]` : ""
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