import { useTheme } from "@/app/components/theme/ThemeContext ";
import { getColorShade } from "@/app/components/utilities/syncFunctions/syncs";
import React from "react";

const Menu = () => {
  const { theme } = useTheme();
  return (
    <div>
      <div
        style={{
          backgroundColor: getColorShade(theme.background, 10),
        }}
        className="border rounded-xl p-4 min-w-md max-w-lg "
      >
        <h2 className="font-semibold text-xl mb-5">{"Menu"}</h2>
        <div className="bg-[var(--background)]">

        </div>
      </div>
    </div>
  );
};

export default Menu;
