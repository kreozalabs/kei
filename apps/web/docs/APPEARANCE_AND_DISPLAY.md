# Appearance, Motion & Display System Guidelines

This document details the architectural pattern, root data attribute engine, and component usage guidelines for the **Appearance & Display System** in `apps/web` and `@kreozalabs/kei-ui`.

---

## 1. Architecture: Zero Re-Render Root Data-Attributes

To prevent heavy React component re-renders when users change appearance preferences, the system operates on a **Pure CSS Root Attribute Pattern**:

```
[User Changes Setting]
          │
          ▼
[SettingsProvider] ──► Syncs attributes to document.documentElement (<html>)
          │
          ▼
<html data-motion="smooth" data-minimal="true" data-density="compact" data-grid-lines="subtle" data-behavior="subtle_on_idle">
          │
          ▼
[tokens.css & CSS Selectors] ──► Instant CSS token & slot rule evaluation app-wide
```

### Key Advantage:

- **0ms React Re-render Overhead:** Setting updates mutate single root attributes on `<html />`. Every page, modal, table, list, card, and floating toolbar across the entire application reacts instantly via pure CSS.

---

## 2. Automatic vs. Manual Developer Guide

### Summary Matrix

| Setting                  | Automatic or Manual?                                                          | Where & How It Applies                                                                                                                                                                                                                                                        |
| :----------------------- | :---------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`animations`**         | 🟢 **100% Automatic**                                                         | **Zero code required.** All UI components (`Sidebar`, `Sheet`, `Dialog`, `Drawer`, `Popover`, `DropdownMenu`, `Tooltip`, `Select`, `Command`) observe motion tokens via built-in `data-slot="..."` attributes. Off mode zeroes out all DOM transitions & animations natively. |
| **`interface_density`**  | 🟢 **Automatic for Tables & Cards**<br>🟡 **Manual for Custom Flex Lists**    | **Automatic** for all `<Table>`, `<TableCell>`, `<TableHead>`, `<Card>`, `<CardHeader>`, `<CardContent>`, and `<CardFooter>` components.<br>**Manual (`.density-item`)** only needed when building custom flex list rows outside standard Cards/Tables.                       |
| **`grid_lines`**         | 🟢 **Automatic for Tables & Cards**<br>🟡 **Manual for Custom Flex Dividers** | **Automatic** for all `<Table>`, `<TableRow>`, `<TableCell>`, and `<Card>` components.<br>**Manual (`.grid-line`)** only needed when styling custom flex container borders outside standard Cards/Tables.                                                                     |
| **`minimal_mode`**       | 🟡 **Manual Tagging**                                                         | **Manual (`.setting-description` / `[data-minimal-hide]`)** required on secondary helper text so CSS knows which text to hide vs. main title headings to keep visible.                                                                                                        |
| **`interface_behavior`** | 🟡 **Manual Tagging**                                                         | **Manual (`.floating-toolbar`)** required on floating bars (e.g. `BulkActionBar`, `MobileFAB`, floating headers) so CSS knows which elements should idle-fade or auto-hide.                                                                                                   |

---

### Detailed Developer Usage Guide

#### A. What Works 100% AUTOMATICALLY (No Code / Classes Needed)

1. **All Animations & Transitions (`animations`):**
   - Standard `@kreozalabs/kei-ui` components automatically observe active motion durations (`Smooth` 300-500ms, `Reduced` 150-200ms, or `Off` 0ms).
   - No developer action required.

2. **UI Tables & UI Cards (`interface_density` & `grid_lines`):**
   - Any layout using `@kreozalabs/kei-ui` `<Table>`, `<TableCell>`, `<TableHead>`, `<Card>`, `<CardHeader>`, `<CardContent>`, or `<CardFooter>` automatically reacts to density padding changes (`compact`, `comfortable`, `spacious`) and grid line contrast changes (`subtle`, `high_contrast`, `hidden`).
   - No developer action required.

---

#### B. What Requires MANUAL Tagging (Where & Why)

1. **Secondary Text for Minimal Mode (`minimal_mode`):**
   - **Where to add:** On secondary helper captions, card descriptions, or sub-text paragraphs.
   - **Class to use:** `.setting-description`, `.card-subtext`, or `data-minimal-hide`.
   - **Why:** CSS needs to differentiate between critical section headers (which must stay visible) vs. secondary helper text (which should hide when Minimal Mode is ON).

   ```tsx
   {
     /* Example: Description hides automatically in Minimal Mode */
   }
   <div className="space-y-1">
     <h3 className="text-sm font-medium">Main Option Title</h3>
     <p className="setting-description text-muted-foreground text-xs">
       Optional helper description that disappears when minimal mode is active.
     </p>
   </div>;
   ```

2. **Floating Bars & Toolbars for Idle Behavior (`interface_behavior`):**
   - **Where to add:** On floating action bars, floating action buttons (`MobileFAB`), fixed bottom toolbars, or floating headers.
   - **Class to use:** `.floating-toolbar` or `data-floating-control`.
   - **Why:** CSS needs to identify which floating containers should fade (`subtle_on_idle`) or slide off-screen (`auto_hide`) when user focus leaves the element.

   ```tsx
   {
     /* Example: Floating bar auto-fades / slides off-screen when idle */
   }
   <div className="floating-toolbar bg-card fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border p-3 shadow-xl">
     <Button size="sm">Action</Button>
   </div>;
   ```

3. **Custom Non-Table / Non-Card List Items (`interface_density` & `grid_lines`):**
   - **Where to add:** Only when building custom flex list containers or custom list items outside standard UI Cards or Tables.
   - **Classes to use:** `.density-item` (for padding) and `.grid-line` (for borders).
   ```tsx
   {
     /* Example: Custom list row observing density padding & grid line borders */
   }
   <div className="density-item grid-line flex items-center justify-between border-b px-3 py-2">
     <span>Custom List Item</span>
   </div>;
   ```

---

## 3. Core Display & Motion CSS Token Specifications

[This Is The Source File](packages/ui/src/styles/tokens.css): `packages/ui/src/styles/tokens.css`

### 1. `animations` (`"smooth"` | `"reduced"` | `"off"`)

```css
:root,
[data-motion="smooth"] {
  --sidebar-transition-duration: 500ms;
  --sidebar-transition-ease: cubic-bezier(0.32, 0.72, 0, 1);
  --sheet-transition-duration: 400ms;
  --sheet-transition-ease: cubic-bezier(0.32, 0.72, 0, 1);
  --ui-transition-duration: 300ms;
  --ui-transition-ease: cubic-bezier(0.32, 0.72, 0, 1);
}

[data-motion="reduced"] {
  --sidebar-transition-duration: 200ms;
  --sidebar-transition-ease: ease-linear;
  --sheet-transition-duration: 200ms;
  --sheet-transition-ease: ease-linear;
  --ui-transition-duration: 150ms;
  --ui-transition-ease: ease-linear;
}

[data-motion="off"] {
  --sidebar-transition-duration: 0ms;
  --sheet-transition-duration: 0ms;
  --ui-transition-duration: 0ms;
}

[data-motion="off"],
[data-motion="off"] * {
  transition-duration: 0ms !important;
  animation-duration: 0ms !important;
}
```

---

### 2. `minimal_mode` (`boolean`)

```css
[data-minimal="true"] .setting-description,
[data-minimal="true"] [data-minimal-hide],
[data-minimal="true"] .card-subtext {
  display: none !important;
}
```

---

### 3. `interface_density` (`"compact"` | `"comfortable"` | `"spacious"`)

```css
[data-density="compact"] {
  --density-padding-y: 0.375rem;
  --density-padding-x: 0.5rem;
  --density-gap: 0.5rem;
  --density-row-height: 2rem;
  --density-font-size: 0.8125rem;
}

[data-density="comfortable"] {
  --density-padding-y: 0.5rem;
  --density-padding-x: 0.75rem;
  --density-gap: 0.75rem;
  --density-row-height: 2.5rem;
  --density-font-size: 0.875rem;
}

[data-density="spacious"] {
  --density-padding-y: 0.75rem;
  --density-padding-x: 1rem;
  --density-gap: 1rem;
  --density-row-height: 3rem;
  --density-font-size: 0.9375rem;
}

[data-density] [data-slot="table-cell"],
[data-density] [data-slot="table-head"],
[data-density] [data-slot="card-content"],
[data-density] [data-slot="card-header"],
[data-density] [data-slot="card-footer"],
[data-density] .density-item {
  padding-top: var(--density-padding-y) !important;
  padding-bottom: var(--density-padding-y) !important;
}
```

---

### 4. `grid_lines` (`"subtle"` | `"high_contrast"` | `"hidden"`)

```css
[data-grid-lines="subtle"] {
  --grid-border-color: var(--border);
  --grid-border-width: 1px;
  --grid-border-opacity: 0.5;
}

[data-grid-lines="high_contrast"] {
  --grid-border-color: var(--foreground);
  --grid-border-width: 1px;
  --grid-border-opacity: 0.8;
}

[data-grid-lines="hidden"] {
  --grid-border-color: transparent;
  --grid-border-width: 0px;
  --grid-border-opacity: 0;
}

[data-grid-lines] [data-slot="table-cell"],
[data-grid-lines] [data-slot="table-head"],
[data-grid-lines] [data-slot="table-row"],
[data-grid-lines] [data-slot="card"],
[data-grid-lines] .grid-line {
  border-color: var(--grid-border-color) !important;
}
```

---

### 5. `interface_behavior` (`"always_visible"` | `"subtle_on_idle"` | `"auto_hide"`)

```css
[data-behavior="subtle_on_idle"] .floating-toolbar:not(:hover):not(:focus-within) {
  opacity: 0.4;
  transition: opacity var(--ui-transition-duration) var(--ui-transition-ease);
}

[data-behavior="auto_hide"] .floating-toolbar:not(:hover):not(:focus-within) {
  transform: translateY(100%);
  opacity: 0;
  transition:
    transform var(--ui-transition-duration) var(--ui-transition-ease),
    opacity var(--ui-transition-duration) var(--ui-transition-ease);
}
```
