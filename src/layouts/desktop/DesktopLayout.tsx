import { SidebarAds } from "../../features/ads/SidebarAds";

export function DesktopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="spk-page spk-page--desktop">
      <aside className="spk-sidebar">
        <SidebarAds />
      </aside>
      <main className="spk-main spk-main--desktop">{children}</main>
    </div>
  );
}
