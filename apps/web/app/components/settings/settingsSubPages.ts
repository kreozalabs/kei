import * as React from "react";
import { KeyboardShortcutsSettings } from "./general/KeyboardShortcuts";

export const SETTINGS_BASE_PATH = "/app/settings";

/**
 * Returns the full application path for a given settings relative slug.
 * Example: getSettingsPath("extensions") -> "/app/settings/extensions"
 * Example: getSettingsPath("general/shortcuts") -> "/app/settings/general/shortcuts"
 */
export function getSettingsPath(slug: string = ""): string {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, "");
  return cleanSlug ? `${SETTINGS_BASE_PATH}/${cleanSlug}` : SETTINGS_BASE_PATH;
}

export interface SettingsSubPageDefinition {
  id: string;
  slug: string | string[];
  title: string;
  parentSlug?: string;
  component: React.ComponentType;
}

export const SETTINGS_SUB_PAGES: SettingsSubPageDefinition[] = [
  {
    id: "keyboard-shortcuts",
    slug: ["shortcuts", "general/shortcuts"],
    title: "Keyboard Shortcuts",
    component: KeyboardShortcutsSettings,
  },
];

/**
 * Gets the primary canonical slug for a subpage.
 */
export function getCanonicalSlug(subpageDef: SettingsSubPageDefinition): string {
  return Array.isArray(subpageDef.slug) ? subpageDef.slug[0] : subpageDef.slug;
}

/**
 * Gets the primary canonical path for a subpage.
 */
export function getCanonicalPath(subpageDef: SettingsSubPageDefinition): string {
  return getSettingsPath(getCanonicalSlug(subpageDef));
}

export function findSubPageByPath(pathname?: string): SettingsSubPageDefinition | undefined {
  if (!pathname) return undefined;

  // Strip base settings prefix if present e.g. "/app/settings/extensions" -> "extensions"
  const cleanInput = pathname
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\/[^\/]+/, "")
    .replace(/^\/?app\/settings\/?/i, "")
    .replace(/^\/+|\/+$/g, "");

  return SETTINGS_SUB_PAGES.find((page) => {
    const slugs = Array.isArray(page.slug) ? page.slug : [page.slug];

    return slugs.some((s) => {
      const cleanSlug = s
        .toLowerCase()
        .trim()
        .replace(/^\/+|\/+$/g, "");

      if (cleanInput === cleanSlug) return true;
      if (cleanSlug.endsWith(`/${cleanInput}`)) return true;
      if (cleanInput.endsWith(`/${cleanSlug}`)) return true;
      if (page.id.toLowerCase() === cleanInput) return true;

      return false;
    });
  });
}

export interface BackNavigationInfo {
  backTo: string;
  backLabel: string;
}

export function getBackNavigation(subpageDef?: SettingsSubPageDefinition): BackNavigationInfo {
  if (!subpageDef) {
    return { backTo: SETTINGS_BASE_PATH, backLabel: "Back to Settings" };
  }

  // 1. Explicit parentSlug defined on subpage
  if (subpageDef.parentSlug) {
    const parent = findSubPageByPath(subpageDef.parentSlug);
    return {
      backTo: getSettingsPath(subpageDef.parentSlug),
      backLabel: parent ? `Back to ${parent.title}` : "Back to Settings",
    };
  }

  // 2. Infer parent from slug hierarchy e.g. "appearance/theme" -> parent "appearance"
  const primarySlug = getCanonicalSlug(subpageDef);
  const segments = primarySlug.replace(/^\/+|\/+$/g, "").split("/");

  if (segments.length > 1) {
    const parentSlug = segments.slice(0, -1).join("/");
    const parentDef = findSubPageByPath(parentSlug);

    if (parentDef) {
      return {
        backTo: getSettingsPath(parentSlug),
        backLabel: `Back to ${parentDef.title}`,
      };
    }
  }

  // Default fallback to settings main page
  return {
    backTo: SETTINGS_BASE_PATH,
    backLabel: "Back to Settings",
  };
}
