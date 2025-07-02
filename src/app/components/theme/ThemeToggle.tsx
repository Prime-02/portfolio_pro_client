"use client"

import { useTheme } from "./ThemeContext ";

function ThemeToggle() {
  const { themeVariant, toggleThemeVariant, isDarkMode } = useTheme();
  
  return (
    <button type="submit" onClick={toggleThemeVariant}>
      Current: {themeVariant} ({isDarkMode ? 'dark' : 'light'})
    </button>
  );
}

export default ThemeToggle