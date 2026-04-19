import { AdaptiveLayout } from "../layouts/AdaptiveLayout";
import { FeedRouter } from "../shared/components/FeedRouter";

export function HomePage() {
  return (
    <AdaptiveLayout>
      <FeedRouter />
    </AdaptiveLayout>
  );
}
