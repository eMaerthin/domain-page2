import { useEffect, useState } from "react";
import { computeDeterministicVariant, resolveVariantFromUrlAndStorage } from "./assignVariant";
import { EXPERIMENT_NAME, type ExperimentVariant } from "./types";
import { getUserId } from "../user/getUserId";
import { getCookie, setCookie } from "../storage/cookies";

export function useExperiment(name: string): ExperimentVariant {
  if (name !== EXPERIMENT_NAME) {
    // For now we only implement homepage_v1 as per spec
    name;
  }
  const [variant, setVariant] = useState<ExperimentVariant>("hybrid");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `spk_variant:${EXPERIMENT_NAME}`;
    const cookieVariant = getCookie(`variant:${EXPERIMENT_NAME}`);
    const resolved = resolveVariantFromUrlAndStorage();
    if (resolved) {
      try {
        localStorage.setItem(key, resolved);
      } catch {}
      setCookie(`variant:${EXPERIMENT_NAME}`, resolved);
      setVariant(resolved);
      return;
    }
    if (cookieVariant === "quiz" || cookieVariant === "tools" || cookieVariant === "hybrid") {
      setVariant(cookieVariant);
      try {
        localStorage.setItem(key, cookieVariant);
      } catch {}
      return;
    }
    const userId = getUserId();
    const v = computeDeterministicVariant(userId);
    try {
      localStorage.setItem(key, v);
    } catch {}
    setCookie(`variant:${EXPERIMENT_NAME}`, v);
    setVariant(v);
  }, []);

  return variant;
}
