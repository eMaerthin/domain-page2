import { useExperiment } from "../../core/experiment/useExperiment";
import { EXPERIMENT_NAME, type ExperimentVariant } from "../../core/experiment/types";
import { QuizFeed } from "../../features/quiz/QuizFeed";
import { ToolsFeed } from "../../features/tools/ToolsFeed";
import { HybridFeed } from "../../features/feed/HybridFeed";

export function FeedRouter() {
  const variant: ExperimentVariant = useExperiment(EXPERIMENT_NAME);
  if (variant === "quiz") return <QuizFeed />;
  if (variant === "tools") return <ToolsFeed />;
  return <HybridFeed />;
}
