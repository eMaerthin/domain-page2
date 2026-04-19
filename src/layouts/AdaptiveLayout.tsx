import { useDevice } from "../core/device/useDevice";
import { MobileLayout } from "./mobile/MobileLayout";
import { DesktopLayout } from "./desktop/DesktopLayout";

export function AdaptiveLayout({ children }: { children: React.ReactNode }) {
  const { isMobile } = useDevice();
  return isMobile ? <MobileLayout>{children}</MobileLayout> : <DesktopLayout>{children}</DesktopLayout>;
}
