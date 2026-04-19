export type ExperimentVariant = "quiz" | "tools" | "hybrid";

export const EXPERIMENT_NAME = "homepage_v1";

export const VARIANT_WEIGHTS: Array<{ variant: ExperimentVariant; weight: number }> = [
  { variant: "quiz", weight: 34 },
  { variant: "tools", weight: 34 },
  { variant: "hybrid", weight: 32 },
];
