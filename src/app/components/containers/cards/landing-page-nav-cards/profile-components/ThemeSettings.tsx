import Link from "next/link";
import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { IconType } from "react-icons";
import { useTheme } from "@/src/app/components/theme/ThemeContext";
import { ThemeVariant } from "@/src/app/components/types and interfaces/loaderTypes";
import Button from "@/src/app/components/buttons/Buttons";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { useUIStore } from "@/lib/stores/ui/useUIStore";

const ThemeSettings = () => {
  const { themeVariant, setThemeVariant } = useTheme();
  const { toggleMobileMenu } = useUIStore()
  const { userInfo } = useUserSettings();

  type ThemeType = {
    theme: ThemeVariant;
    name: string;
    icon: IconType;
  };
  const themes: ThemeType[] = [
    {
      theme: "light",
      name: "Light Mode",
      icon: Sun,
    },
    {
      theme: "dark",
      name: "Dark Mode",
      icon: Moon,
    },
    {
      theme: "system",
      name: "System's Default",
      icon: Monitor,
    },
  ];

  return (
    <div className="p-4 space-y-4 w-full">
      <h2 className="text-lg font-semibold">Theme Preferences</h2>
      <div className="space-y-2 w-full">
        {themes.map(({ theme, name, icon: Icon }) => (
          <div
            key={theme}
            className={`p-3 rounded-lg cursor-pointer transition-colors w-full ${themeVariant === theme
              ? "text-[var(--accent)] dark:text-[var(--accent)]"
              : "hover:bg-[var(--background)]"
              }`}
            onClick={() => {
              toggleMobileMenu()
              toggleMobileMenu(false)
              setThemeVariant(theme);
            }}
          >
            <div className="flex items-center">
              <div
                className={`mr-3 ${themeVariant === theme
                  ? "text-[var(--accent)]"
                  : "opacity-65"
                  }`}
              >
                <Icon />
              </div>
              <span>{name}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full">
        <Link
          href={`/${userInfo?.username}/preference`}
          className="block w-full"
        >
          <Button
            variant="outline"
            size="md"
            text="Go to theme settings"
            type="button"
            className="w-full"
          />
        </Link>
      </div>
    </div>
  );
};

export default ThemeSettings;
