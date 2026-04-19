import { EXPERIMENT_NAME, VARIANT_WEIGHTS, type ExperimentVariant } from "./types";
import { stableHashToInt } from "./hash";

export function resolveVariantFromUrlAndStorage() {
  const key = `spk_variant:${EXPERIMENT_NAME}`;
  const stored = (() => {
    try {
      return localStorage.getItem(key) ?? undefined;
    } catch {
      return undefined;
    }
  })();

  const url = new URL(window.location.href);
  const urlVariant = url.searchParams.get("variant");
  if (urlVariant === "quiz" || urlVariant === "tools" || urlVariant === "hybrid") {
    return urlVariant satisfies ExperimentVariant;
  }

  if (stored === "quiz" || stored === "tools" || stored === "hybrid") return stored as ExperimentVariant;
  return undefined;
}

export function computeDeterministicVariant(userId: string): ExperimentVariant {
  const totalWeight = VARIANT_WEIGHTS.reduce((s, w) => s + w.weight, 0);
  const r = stableHashToInt(userId + EXPERIMENT_NAME) % totalWeight;
  let acc = 0;
  for (const w of VARIANT_WEIGHTS) {
    acc += w.weight;
    if (r < acc) return w.variant;
  }
  return VARIANT_WEIGHTS[0].variant;
}
