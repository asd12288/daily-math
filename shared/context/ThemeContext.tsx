"use client";

import React, { createContext, useState, useContext, useEffect, useRef, ReactNode } from "react";

interface ThemeContextState {
  activeMode: "light" | "dark";
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextState | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [activeMode, setActiveMode] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const isInitialized = useRef(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const themeToApply = savedTheme || (prefersDark ? "dark" : "light");

    // Batch state updates using requestAnimationFrame
    requestAnimationFrame(() => {
      setActiveMode(themeToApply);
      setMounted(true);
    });
  }, []);

  // Update document class when theme changes
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(activeMode);
      localStorage.setItem("theme", activeMode);
    }
  }, [activeMode, mounted]);

  const toggleMode = () => {
    setActiveMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ activeMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextState => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
