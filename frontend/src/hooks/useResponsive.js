import { useState, useEffect } from "react";

/**
 * Custom hook for responsive design
 * Returns current screen size category and viewport dimensions
 * 
 * Breakpoints:
 * - mobile: < 640px
 * - tablet-sm: 640px - 1024px
 * - tablet: 1024px - 1280px
 * - desktop: >= 1280px
 */
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    width: screenSize.width,
    height: screenSize.height,
    isMobile: screenSize.width < 640,
    isTabletSm: screenSize.width >= 640 && screenSize.width < 1024,
    isTablet: screenSize.width >= 1024 && screenSize.width < 1280,
    isDesktop: screenSize.width >= 1280,
    isTabletOrSmaller: screenSize.width < 1024,
    isDesktopOrLarger: screenSize.width >= 1024,
  };
};
