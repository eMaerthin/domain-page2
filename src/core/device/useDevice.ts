import { useMemo } from "react";

export function useDevice() {
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(max-width: 768px)")?.matches ?? false;
  }, []);
  return { isMobile };
}
