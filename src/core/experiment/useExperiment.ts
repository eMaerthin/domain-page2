import { useEffect, useMemo, useState } from "react";
import { computeDeterministicVariant, resolveVariantFromUrlAndStorage } from "./assignVariant";
import { EXPERIMENT_NAME, type ExperimentVariant } from "./types";
import { getUserId } from "../user/getUserId";

export function useExperiment(name: string): ExperimentVariant {
  if (name !== EXPERIMENT_NAME) {
    // For now we only implement homepage_v1 as per spec
    name;
  }
  const [variant, setVariant] = useState<ExperimentVariant>("hybrid");
  const resolved = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return resolveVariantFromUrlAndStorage();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `spk_variant:${EXPERIMENT_NAME}`;
    if (resolved) {
      try {
        localStorage.setItem(key, resolved);
      } catch {}
      setVariant(resolved);
      return;
    }
    const userId = getUserId();
    const v = computeDeterministicVariant(userId);
    try {
      localStorage.setItem(key, v);
    } catch {}
    setVariant(v);
  }, [resolved]);

  return variant;
}
