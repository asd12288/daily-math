"use client";

import React, { createContext, useState, ReactNode } from "react";

interface DashboardContextType {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (value: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export const DashboardContext = createContext<DashboardContextType>({
  isSidebarOpen: true,
  setIsSidebarOpen: () => {},
  isMobileSidebarOpen: false,
  setIsMobileSidebarOpen: () => {},
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <DashboardContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        isCollapsed,
        setIsCollapsed,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
