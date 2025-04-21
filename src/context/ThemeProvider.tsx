"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

enum Theme {
  Light = "light",
  Dark = "dark",
}

interface ThemeContextType {
  theme: Theme | null;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as Theme) || Theme.Light;
    setTheme(savedTheme);
    document.documentElement.className = savedTheme;
    document.body.className = "bg-gray-50 dark:bg-gray-900"; // Добавляем общий фон
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === Theme.Light ? Theme.Dark : Theme.Light;
      localStorage.setItem("theme", newTheme);
      document.documentElement.className = newTheme;
      document.body.className = "bg-gray-50 dark:bg-gray-900"; // Обновляем фон при смене темы
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
