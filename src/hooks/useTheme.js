import { useEffect } from "react";
import { useStore } from "@/hooks/useStore";

export function useTheme() {
  const { darkMode, setDarkMode, language, setLanguage, themeMode, setThemeMode } = useStore();

  useEffect(() => {
    if (themeMode === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.body.classList.toggle("dark", systemDark);
      setDarkMode(systemDark);
    } else {
      document.body.classList.toggle("dark", darkMode);
    }
  }, [darkMode, themeMode, setDarkMode]);

  return { darkMode, setDarkMode, language, setLanguage, themeMode, setThemeMode };
}
