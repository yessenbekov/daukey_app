"use client";
import { useTheme } from "@/context/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full shadow-md"
    >
      {theme === "light" ? "🌞" : "🌙"}
    </button>
  );
}

export default ThemeToggle;
