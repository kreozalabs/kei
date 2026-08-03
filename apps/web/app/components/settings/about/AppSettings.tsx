import { Logo as KreozaLogo } from "@kreozalabs/logos";
import { Cloud, Heart, Info, Lock, ShieldCheck, Sparkles, WifiOff, Zap } from "lucide-react";
import { SettingBadgeGroup } from "../primitives/SettingBadgeGroup";
import { SettingFeatureGrid, type SettingFeatureItem } from "../primitives/SettingFeatureGrid";
import { SettingSection } from "../primitives/SettingSection";
import { SettingRow } from "../primitives/SettingRow";

export interface AppSettingsProps {
  id?: string;
}

const APP_FEATURES: SettingFeatureItem[] = [
  {
    title: "Super Fast & Instant",
    description: "Everything responds in a snap with zero loading screens or waiting.",
    icon: <Zap className="size-3.5" />,
  },
  {
    title: "Works Anywhere Offline",
    description: "Use all core calendar features anytime, even without internet or Wi-Fi.",
    icon: <WifiOff className="size-3.5" />,
  },
  {
    title: "Safe & Private",
    description: "Your personal schedule stays securely on your device, under your control.",
    icon: <Lock className="size-3.5" />,
  },
  {
    title: "Optional Cloud Sync",
    description: "Sync across multiple devices or unlock advanced features when needed.",
    icon: <Cloud className="size-3.5" />,
  },
  {
    title: "Open & Community Driven",
    description:
      "Anyone can contribute, suggest improvements, or help build new features they want.",
    icon: <Heart className="size-3.5" />,
    colSpan: "full",
  },
];

export const AppSettings = ({ id }: AppSettingsProps) => {
  return (
    <SettingSection
      id={id}
      title="Kreoza Kei"
      description="Your personal calendar—fast, private, and always available offline."
      icon={<KreozaLogo className="size-8" />}
    >
      {/* Description */}
      <SettingRow
        label="What is Kei?"
        description="A fast and private calendar that lives right on your device."
        icon={<Info className="size-4" />}
        layout="column"
        className="p-3 sm:p-4"
      >
        <p className="text-muted-foreground/90 text-sm leading-relaxed">
          Kei works just like a digital notebook. Everything you add or change is saved instantly on
          your own device, so it stays super fast and works fully even without an internet
          connection. When you want to sync across devices or use advanced features, optional cloud
          sync is ready whenever you need it!
        </p>
      </SettingRow>

      {/* Features */}
      <SettingFeatureGrid
        label="Why You'll Love Kei"
        description="Simple features designed to keep your schedule organized and private."
        icon={<Sparkles className="size-4" />}
        className="p-3 sm:p-4"
        items={APP_FEATURES}
      />

      {/* Highlights */}
      <SettingBadgeGroup
        label="Key Highlights"
        description="Built for everyday peace of mind."
        icon={<ShieldCheck className="size-4" />}
        className="p-3 sm:p-4"
        items={[
          "Instant Speed",
          "100% Offline Capable",
          "Your Data Belongs To You",
          "Optional Cloud Sync",
          "Build & Add Features",
        ]}
      />
    </SettingSection>
  );
};
