import { useTheme } from "@/app/components/theme/ThemeContext ";
import { getColorShade } from "@/app/components/utilities/syncFunctions/syncs";
import React, { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  backgroundClass?: string;
  containerClass?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  children,
  className = "",
  backgroundClass = "",
  containerClass = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6",
}) => {
  const { theme } = useTheme();
  return (
    <div
      className={` ${className}`}
      style={{
        backgroundColor: getColorShade(theme.background, 10),
      }}
    >
      <div className={containerClass}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title Section */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold ">{title}</h1>
            {subtitle && <p className=" mt-1">{subtitle}</p>}
          </div>

          {/* Actions/Controls */}
          {children && (
            <div className="flex items-center gap-4">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
