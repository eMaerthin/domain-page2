import { useEffect, useState } from "react";
import { useExperiment } from "../../core/experiment/useExperiment";
import { EXPERIMENT_NAME, type ExperimentVariant } from "../../core/experiment/types";
import { QuizFeed } from "../../features/quiz/QuizFeed";
import { ToolsFeed } from "../../features/tools/ToolsFeed";
import { HybridFeed } from "../../features/feed/HybridFeed";

const VARIANT_EVENT = "spk-variant-change";

function readVariantFromLocation() {
  const next = new URL(window.location.href).searchParams.get("variant");
  if (next === "quiz" || next === "tools" || next === "hybrid") return next;
  return undefined;
}

export function FeedRouter() {
  const variant: ExperimentVariant = useExperiment(EXPERIMENT_NAME);
  const [routeVariant, setRouteVariant] = useState<ExperimentVariant>(readVariantFromLocation() ?? variant);

  useEffect(() => {
    const sync = () => setRouteVariant(readVariantFromLocation() ?? variant);
    const onVariantChange = (event: Event) => {
      const detail = (event as CustomEvent<ExperimentVariant>).detail;
      if (detail === "quiz" || detail === "tools" || detail === "hybrid") {
        setRouteVariant(detail);
        return;
      }
      sync();
    };
    sync();
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    window.addEventListener(VARIANT_EVENT, onVariantChange as EventListener);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
      window.removeEventListener(VARIANT_EVENT, onVariantChange as EventListener);
    };
  }, [variant]);

  const current = routeVariant;

  if (window.location.search.includes("tool=1")) return <ToolsFeed />;
  if (current === "quiz") return <QuizFeed />;
  if (current === "tools") return <ToolsFeed />;
  return <HybridFeed />;
}
