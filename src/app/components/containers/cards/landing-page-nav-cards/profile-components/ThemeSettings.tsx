import Button from "@/app/components/buttons/Buttons";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { useGlobalState } from "@/app/globalStateProvider";
import Link from "next/link";
import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { IconType } from "react-icons";
import { ThemeVariant } from "@/app/components/types and interfaces/loaderTypes";

const ThemeSettings = () => {
  const { themeVariant, setThemeVariant } = useTheme();
  const { userData } = useGlobalState();

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
            className={`p-3 rounded-lg cursor-pointer transition-colors w-full ${
              themeVariant === theme
                ? "text-[var(--accent)] dark:text-[var(--accent)]"
                : "hover:bg-[var(--background)]"
            }`}
            onClick={() => {
              setThemeVariant(theme);
            }}
          >
            <div className="flex items-center">
              <div
                className={`mr-3 ${
                  themeVariant === theme
                    ? "text-[var(--accent)]"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                <Icon/>
              </div>
              <span>{name}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full">
        <Link
          href={`/${userData.username}/preference`}
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
