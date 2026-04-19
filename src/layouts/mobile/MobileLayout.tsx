import { StickyBottomAds } from "../../features/ads/StickyBottomAds";

export function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="spk-page spk-page--mobile">
      <main className="spk-main">{children}</main>
      <StickyBottomAds />
    </div>
  );
}
