import { KeyboardIcon } from "lucide-react";
import { LocalizationSettings } from "./LocalizationSettings";
import { getSettingsPath } from "../settingsSubPages";
import { SettingsLinkGroup } from "../primitives/SettingsLinkGroup";

export function GeneralSettings() {
  const navigationLinks = [
    {
      title: "Keyboard shortcuts",
      description: "Manage application hotkeys and quick action key bindings.",
      to: getSettingsPath("shortcuts"),
      icon: <KeyboardIcon className="size-4" />,
      value: "Configure",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-1 py-2 sm:px-2">
      <LocalizationSettings id="language-region" />

      <SettingsLinkGroup items={navigationLinks} className="hidden md:block" />
    </div>
  );
}
