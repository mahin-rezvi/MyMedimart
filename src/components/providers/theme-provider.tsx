"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  attribute?: "class" | string;
  storageKey?: string;
}

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme, attribute: string) {
  const root = document.documentElement;
  const resolved = theme === "system" ? getSystemTheme() : theme;

  if (attribute === "class") {
    root.classList.toggle("dark", resolved === "dark");
    root.classList.toggle("light", resolved === "light");
  } else {
    root.setAttribute(attribute, resolved);
  }

  if (resolved === "dark") {
    root.style.colorScheme = "dark";
  } else {
    root.style.colorScheme = "light";
  }
}

function readTheme(storageKey: string, defaultTheme: Theme, enableSystem: boolean): Theme {
  try {
    const stored = localStorage.getItem(storageKey) as Theme | null;
    if (!stored) return defaultTheme;
    if (stored === "system" && !enableSystem) {
      return defaultTheme;
    }
    return stored;
  } catch {
    return defaultTheme;
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  enableSystem = true,
  attribute = "class",
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    return readTheme(storageKey, defaultTheme, enableSystem);
  });
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">((): "light" | "dark" => {
    if (typeof window === "undefined") {
      return defaultTheme === "system" && enableSystem ? "light" : defaultTheme as "light" | "dark";
    }

    const initialTheme = readTheme(storageKey, defaultTheme, enableSystem);
    return initialTheme === "system" && enableSystem ? getSystemTheme() : (initialTheme as "light" | "dark");
  });

  useEffect(() => {
    applyTheme(theme, attribute);
  }, [attribute, theme]);

  useEffect(() => {
    if (!enableSystem || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => setResolvedTheme(getSystemTheme());

    mediaQuery.addEventListener("change", updateSystemTheme);
    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, [enableSystem, theme]);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    const nextResolved = nextTheme === "system" && enableSystem ? getSystemTheme() : (nextTheme as "light" | "dark");
    setResolvedTheme(nextResolved);
    try {
      localStorage.setItem(storageKey, nextTheme);
    } catch {
      // ignore storage failures
    }
    applyTheme(nextTheme, attribute);
  };

  const value = { theme, resolvedTheme, setTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
