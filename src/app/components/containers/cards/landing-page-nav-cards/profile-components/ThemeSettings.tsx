import Button from "@/app/components/buttons/Buttons";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { useGlobalState } from "@/app/globalStateProvider";
import Link from "next/link";
import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const ThemeSettings = () => {
  const { themeVariant, setThemeVariant } = useTheme();
  const { userData } = useGlobalState();
  const themes = [
    {
      theme: "light",
      name: "Light Mode",
      icon: <Sun className="w-5 h-5" />,
    },
    {
      theme: "dark",
      name: "Dark Mode",
      icon: <Moon className="w-5 h-5" />,
    },
    {
      theme: "system",
      name: "System's Default",
      icon: <Monitor className="w-5 h-5" />,
    },
  ];

  return (
    <div className="p-4 space-y-4 w-full">
      <h2 className="text-lg font-semibold">Theme Preferences</h2>
      <div className="space-y-2 w-full">
        {themes.map(({ theme, name, icon }) => (
          <div
            key={theme}
            className={`p-3 rounded-lg cursor-pointer transition-colors w-full ${
              themeVariant === theme
                ? "text-[var(--accent)] dark:text-[var(--accent)]"
                : "hover:bg-[var(--background)]"
            }`}
            onClick={() => setThemeVariant(theme)}
          >
            <div className="flex items-center">
              <div
                className={`mr-3 ${
                  themeVariant === theme
                    ? "text-[var(--accent)]"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {icon}
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
