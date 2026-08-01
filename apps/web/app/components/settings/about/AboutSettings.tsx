import { GitHub, Logo as KreozaLogo } from "@kreozalabs/logos";
import { ShieldCheck, Sparkles } from "lucide-react";
import { SettingsLinkGroup } from "../primitives/SettingsLinkGroup";
import { AppSettings } from "./AppSettings";
import { VersionSettings } from "./VersionSettings";

export function AboutSettings() {
  const navigationLinks = [
    {
      title: "Kreoza Website",
      description: "Explore Kreoza products, company news, and mission.",
      href: "https://kreoza.com",
      icon: <KreozaLogo className="group-hover:text-foreground size-7 transition-colors" />,
      external: true,
    },
    {
      title: "Kei Calendar",
      description: "Visit the official home page of the Kei Calendar app (kei.kreoza.com).",
      href: "https://kei.kreoza.com",
      icon: <KreozaLogo className="group-hover:text-foreground size-7 transition-colors" />,
      external: true,
    },
    {
      title: "GitHub Repository",
      description: "Explore the open-source codebase, submit issues, or contribute.",
      href: "https://github.com/kreozalabs/kei",
      icon: <GitHub className="group-hover:text-foreground size-7 transition-colors" />,
      external: true,
    },
    {
      title: "Release Notes & Changelog",
      description: "View latest feature releases, security updates, and improvements.",
      href: "https://github.com/kreozalabs/kei/releases",
      icon: <Sparkles className="group-hover:text-foreground size-7 transition-colors" />,
      external: true,
    },
    {
      title: "Open Source License",
      description: "Licensed under GNU AGPLv3. View full license terms and permissions.",
      icon: <ShieldCheck className="group-hover:text-foreground size-7 transition-colors" />,
      href: "https://github.com/kreozalabs/kei/blob/main/LICENSE",
      external: true,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-1 py-2 sm:px-2">
      <AppSettings id="about-app" />
      <VersionSettings id="about-version" />
      {/* Official Links & Resources */}
      <div id="about-links" className="scroll-mt-6">
        <SettingsLinkGroup title="Links & Resources" items={navigationLinks} />
      </div>
    </div>
  );
}
