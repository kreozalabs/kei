import { GeneralSettings } from "./GeneralSettings";
import { KeyboardShortcutsSettings } from "./general/KeyboardShortcuts";

export const SETTINGS_BASE_PATH = "/app/settings";
export const ROOT_SETTINGS_SECTION_ID = "general";

/**
 * Checks if a subpage definition represents the root settings section.
 */
export function isRootSettingsSubPage(subpageDef?: SettingsSubPageDefinition): boolean {
  if (!subpageDef) return true;
  if (subpageDef.id === ROOT_SETTINGS_SECTION_ID) return true;
  const slugs = Array.isArray(subpageDef.slug) ? subpageDef.slug : [subpageDef.slug];
  return slugs.includes("");
}

/**
 * Returns the full application path for a given settings relative slug.
 * Example: getSettingsPath("extensions") -> "/app/settings/extensions"
 * Example: getSettingsPath("extensions/holidays") -> "/app/settings/extensions/holidays"
 */
export function getSettingsPath(slug: string = ""): string {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, "");
  if (!cleanSlug || cleanSlug === ROOT_SETTINGS_SECTION_ID) {
    return SETTINGS_BASE_PATH;
  }
  return `${SETTINGS_BASE_PATH}/${cleanSlug}`;
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
    id: ROOT_SETTINGS_SECTION_ID,
    slug: ["", "general"],
    title: "General",
    component: GeneralSettings,
  },
  {
    id: "keyboard-shortcuts",
    slug: ["shortcuts", "general/shortcuts"],
    title: "Keyboard Shortcuts",
    parentSlug: ROOT_SETTINGS_SECTION_ID,
    component: KeyboardShortcutsSettings,
  },
];

export interface SettingsTreeLeaf {
  id: string;
  label: string;
  href?: string;
  to?: string;
}

export interface SettingsTreeGroup {
  id: string;
  label: string;
  children?: SettingsTreeLeaf[];
  href?: string;
  to?: string;
}

export const SETTINGS_TREE_SECTIONS: SettingsTreeGroup[] = [
  {
    id: ROOT_SETTINGS_SECTION_ID,
    label: "General",
    to: SETTINGS_BASE_PATH,
    children: [
      { id: "language-region", label: "Language & region", href: "#language-region" },
      {
        id: "keyboard-shortcuts",
        label: "Keyboard shortcuts",
        to: getSettingsPath("shortcuts"),
      },
    ],
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
    .replace(/^https?:\/\/[^/]+/, "")
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
    const isRootParent = !parent || isRootSettingsSubPage(parent);
    return {
      backTo: isRootParent ? SETTINGS_BASE_PATH : getSettingsPath(subpageDef.parentSlug),
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
      const isRootParent = isRootSettingsSubPage(parentDef);
      return {
        backTo: isRootParent ? SETTINGS_BASE_PATH : getSettingsPath(parentSlug),
        backLabel: `Back to ${parentDef.title}`,
      };
    }
  }

  // Default fallback for settings subpages back to main settings page
  return {
    backTo: SETTINGS_BASE_PATH,
    backLabel: "Back to Settings",
  };
}
