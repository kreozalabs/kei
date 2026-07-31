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

All settings subpages define **relative slugs** (`slug: "extensions"` or `slug: "general/shortcuts"`).

The base path (`SETTINGS_BASE_PATH = "/app/settings"`) is centralized in [settingsSubPages.ts](/kei/apps/web/app/components/settings/settingsSubPages.ts).

### Usage:

```ts
import { getSettingsPath } from "./settingsSubPages";

// Evaluates to "/app/settings/extensions"
const extensionsPath = getSettingsPath("extensions");

// Evaluates to "/app/settings/general/shortcuts"
const shortcutsPath = getSettingsPath("general/shortcuts");
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

## 5. UI Components Guide (Chrome Aesthetic)

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
