# Settings Architecture & UI Guidelines

This document outlines the architecture, routing model, and component conventions for the Settings module in `apps/web`.

---

## 1. Overview & Key Goals

The settings module adopts a **Chrome browser settings aesthetic**:

- Encapsulated setting cards with edge-to-edge hover states (`SettingsLinkGroup` + `SettingsLinkRow`).
- Relative slug routing via `getSettingsPath("extensions")` avoiding hardcoded `/app/settings` repetition.
- Hierarchical back navigation (navigating to nested subgroup pages automatically computes `Back to {Parent Title}`).
- Zero route file duplication: All subpages are managed via a dynamic splat route and central registry.

---

## 2. Relative Slugs & `getSettingsPath` Helper

All settings subpages define **relative slugs** (`slug: "extensions"` or `slug: "shortcuts"`).

The base path (`SETTINGS_BASE_PATH = "/app/settings"`) is centralized in [settingsSubPages.ts](/apps/web/app/components/settings/settingsSubPages.ts). General settings lives directly at `/app/settings`.

### Usage:

```ts
import { getSettingsPath } from "./settingsSubPages";

// Evaluates to "/app/settings/extensions"
const extensionsPath = getSettingsPath("extensions");

// Evaluates to "/app/settings/shortcuts"
const shortcutsPath = getSettingsPath("shortcuts");
```

---

## 3. Dynamic Back Navigation

When navigating deep into nested subpages (e.g., `/app/settings/appearance/theme`), the system automatically resolves the parent subpage title and path:

- **Level 2 Page** (`slug: "appearance"`): Back button reads **"Back to Settings"** (`/app/settings`).
- **Level 3 Page** (`slug: "appearance/theme"`): Back button reads **"Back to Appearance & Themes"** (`/app/settings/appearance`).

You can also explicitly override the back target by specifying `parentSlug` in `settingsSubPages.ts`:

```ts
{
  id: "appearance-theme",
  slug: ["appearance/theme", "theme"],
  title: "Theme & Colors",
  parentSlug: "appearance", // Custom parent override
  component: ThemeSettings,
}
```

---

## 4. How to Add a New Settings Subpage

To add a new subpage (e.g. `Extensions` or `Appearance Layout`), follow 3 simple steps:

### Step 1: Create the Subpage Component

Create your subpage component inside `apps/web/app/components/settings/` (e.g. `ExtensionsSettings.tsx`).

### Step 2: Register in `settingsSubPages.ts`

Import your component and add an entry to `SETTINGS_SUB_PAGES`:

```ts
{
  id: "extensions",
  slug: "extensions", // or multiple slugs: ["extensions", "general/extensions"]
  title: "Extensions",
  component: ExtensionsSettings,
}
```

### Step 3: Add a `SettingsLinkRow` in the parent settings view

```tsx
<SettingsLinkRow
  title="Extensions"
  description="Manage browser add-ons and holidays integration."
  to={getSettingsPath("extensions")}
  icon={<BlocksIcon className="size-4" />}
  value="Enabled"
/>
```

---

## 5. Table of Contents & Navigation Tree (`SettingsSidebar`)

The settings layout includes a **Table of Contents (TOC) / Navigation Tree sidebar** ([SettingsSidebar.tsx](/apps/web/app/components/settings/layout/SettingsSidebar.tsx)):

- Built with accessibility ARIA tree structure (`role="tree"`, `role="treeitem"`, `role="group"`).
- Supports collapsible groups (`General`, `Appearance`, `Actions`, `Maintenance & Sync`, `System Diagnostics`).
- Synchronizes with in-page section `#id` anchors using the decoupled `useScrollSpy` hook ([useScrollSpy.ts](/apps/web/app/hooks/useScrollSpy.ts)) as the user scrolls.

### Section ID Anchoring Pattern

Setting section components accept an optional `id` prop (forwarded to `SettingSection` card container):

```tsx
<LocalizationSettings id="language-region" />
```

### Adding a Section or Group to the Table of Contents Tree

To register a section or group in the TOC sidebar, update `SETTINGS_TREE_SECTIONS` in [settingsSubPages.ts](/apps/web/app/components/settings/settingsSubPages.ts):

```ts
{
  id: "general",
  label: "General",
  to: SETTINGS_BASE_PATH, // Group route destination (/app/settings)
  children: [
    { id: "language-region", label: "Language & region", href: "#language-region" }, // Section anchor
    { id: "keyboard-shortcuts", label: "Keyboard shortcuts", to: getSettingsPath("shortcuts") }, // Subpage link (/app/settings/shortcuts)
  ],
}
```

> [!IMPORTANT]
> **Group Route Resolution Rule**: Group items can specify a `to` path (e.g. `/app/settings/general`). When users navigate to `/app/settings`, the index route automatically redirects to `/app/settings/general`. When clicking a group header in the sidebar, it toggles group expansion AND navigates to the group's route.

---

## 6. UI Components Guide (Chrome Aesthetic)

### `SettingsLinkGroup`

Card container for grouping link rows:

- `title`: Section title string/node (optional)
- `items`: Array of `SettingsLinkRowProps`
- `className`: Custom classes (optional)

### `SettingsLinkRow`

Individual link row item inside a card:

- `title`: Row heading title
- `description`: Subtitle or description text
- `to`: Internal App route path (uses React Router `<Link>`)
- `href`: External web URL (uses `<a target="_blank">`)
- `icon`: Left icon component
- `value`: Right-aligned status label/badge (e.g. `"Configured"`, `"Default"`)
- `external`: Renders `ExternalLink` icon instead of `ChevronRight`
- `disabled`: Disables interaction and mutes opacity
