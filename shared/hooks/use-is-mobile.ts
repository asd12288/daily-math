// shared/hooks/use-is-mobile.ts
// Hook to detect mobile devices based on viewport width

"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect if the viewport is mobile-sized
 * @param breakpoint - The width breakpoint in pixels (default: 768px for md)
 * @returns boolean indicating if viewport is below the breakpoint
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === "undefined") return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check on mount
    checkMobile();

    // Listen for resize events
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Hook to detect if the viewport is tablet-sized or smaller
 * @returns boolean indicating if viewport is below 1024px (lg breakpoint)
 */
export function useIsTablet(): boolean {
  return useIsMobile(1024);
}

/**
 * Hook to detect if the viewport is desktop-sized
 * @returns boolean indicating if viewport is 1024px or larger
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);

    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  return isDesktop;
}
