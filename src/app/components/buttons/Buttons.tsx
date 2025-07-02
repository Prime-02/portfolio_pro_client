import React, { ReactNode, MouseEvent } from "react";
import { getLoader, SpinLoader } from "../loaders/Loader";
import { useTheme } from "../theme/ThemeContext ";

type ButtonProps = {
  icon?: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  text?: string;
  loading?: boolean;
  disabled?: boolean;
  title?: string;
  type?: "button" | "submit" | "reset";
};

const Button = ({
  icon,
  onClick,
  className = "",
  text = "",
  loading = false,
  disabled = false,
  title,
  type = "button",
}: ButtonProps) => {
  const {accentColor, loader} = useTheme()
const Loader = getLoader(loader) || SpinLoader; // Import SpinLoader or another default
  return (
    <button
      title={title}
      type={type}
      disabled={disabled || loading}
      className={`${className} cursor-pointer min-w-fit min-h-fit flex items-center justify-center rounded-full active:translate-y-1 focus:outline-none transition duration-200 shadow-md`}
      onClick={onClick}
    >
      {loading ? (
        <Loader size={25} color={accentColor} />
      ) : (
        <span className="flex items-center space-x-2">
          {icon}
          {text && <span>{text}</span>}
        </span>
      )}
    </button>
  );
};

export default Button;