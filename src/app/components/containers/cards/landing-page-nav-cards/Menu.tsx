import { useTheme } from "@/app/components/theme/ThemeContext ";
import { privateRoutes } from "@/app/components/utilities/indices/NavigationItems";
import { getColorShade } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

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
  CONTENT: ["media-gallery", "testimonials", "content-block"],
  SETTINGS: ["preference"],
};

const Menu = () => {
  const { theme, accentColor } = useTheme();
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

  return (
    <div
      style={{
        backgroundColor: getColorShade(theme.background, 10),
         maxHeight: "65dvh" 
      }}
      //          style={{ maxHeight: "65dvh" }}
      className="rounded-xl p-2 overflow-auto min-w-md max-w-lg h-full flex flex-col"
    >
      <h2 className="font-semibold text-xl mb-3">{"Menu"}</h2>
      <div className="flex gap-x-2 ">
        <SimpleBar
          className="flex-1  overflow-y-auto md:hidden max-w-2/3 rounded-2xl"
          autoHide={false}
          scrollbarMinSize={48}
        >
          <div className="flex h-full">
            <div className="bg-[var(--background)] h-full w-full">
              <div className="flex-1 py-4 pr-2">
                {groupedRoutes.map(({ category, routes }) => (
                  <div key={category} className="mb-4">
                    <h3 className="text-xs font-semibold text-muted-foreground px-4 mb-2">
                      {category}
                    </h3>
                    {routes.map((route, i) => (
                      <Link
                        key={i}
                        href={`/${userData?.username || "user"}/${route.link}`}
                        className="block"
                      >
                        <div
                          className="mx-2 mb-2 p-3 rounded-lg transition-all duration-300 ease-in-out hover:bg-opacity-20 hover:bg-[var(--background)] text-foreground cursor-pointer group flex items-center gap-3"
                          style={{
                            color: isActiveRoute(route.link)
                              ? accentColor.color
                              : theme.foreground,
                            backgroundColor: isActiveRoute(route.link)
                              ? `${accentColor.color}20`
                              : "none",
                          }}
                        >
                          <div
                            className="flex-shrink-0 border w-10 h-10 flex items-center justify-center rounded-full"
                            style={{
                              backgroundColor: getColorShade(
                                theme.background,
                                10
                              ),
                            }}
                          >
                            <route.icon
                              size={20}
                              className="transition-transform duration-300 ease-in-out group-hover:scale-110"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm transition-opacity duration-300 ease-in-out">
                              {route.name}
                            </span>
                            {route.description && (
                              <span className="text-xs text-muted-foreground">
                                {route.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SimpleBar>
        <div className="bg-[var(--background)] overflow-auto min-h-[50dvh] h-fit rounded-2xl shadow-xl p-4 md:w-full min-w-1/3">
          <h3 className="font-semibold text-lg mb-4">Create New</h3>
          <div className="flex flex-col gap-3">
            {privateRoutes
              .filter((route) =>
                [
                  "portfolios",
                  "projects",
                  "resume",
                  "certification",
                  "socials",
                  "education",
                  "skills",
                ].includes(route.slug)
              )
              .map((route, i) => (
                <Link
                  key={i}
                  href={`/${userData?.username}/${route.link}?create=true`}
                  className="block"
                >
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--background-hover)] transition-colors duration-200">
                    <div
                      className="flex-shrink-0 border w-9 h-9 flex items-center justify-center rounded-full"
                      style={{
                        backgroundColor: getColorShade(theme.background, 10),
                      }}
                    >
                      <route.icon size={16} />
                    </div>
                    <span className="font-medium">{route.name}</span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
