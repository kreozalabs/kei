# Localization & Formatting Architecture

This document describes the design, API, and developer guidelines for the unified localization system in `apps/web`.

---

## 1. Overview & Core Guarantees

The localization system ensures date formats (`DD/MM/YYYY`, `MM/DD/YYYY`, `YYYY/MM/DD`), time formats (`12-hour` vs `24-hour`), timezones, and display language preferences are applied **consistently** across all UI components without requiring manual conditional logic (`? :`).

### Core Rules:

1. **Store in UTC:** Database records and domain events always store raw dates in standard **UTC ISO 8601** format (`YYYY-MM-DDTHH:mm:ss.sssZ`).
2. **Materialized Read Model:** Localization settings updated in settings write a `SETTING_UPDATED` event to the database and update a materialized KV read model.
3. **Cross-Tab Reactivity:** `SettingsProvider` listens to `BroadcastChannel("kei_db_sync")` and updates React state across all tabs in real-time.
4. **Zero-Conditional Presentation:** UI components consume dates via the `useLocalization()` hook without needing inline `if/else` or ternary branching.

---

## 2. The `useLocalization()` Hook

Every component needing date or time formatting should use `useLocalization()` from `@/hooks/useLocalization`:

```tsx
import { useLocalization } from "@/hooks/useLocalization";

export function ActionItem({ action }: { action: Action }) {
  const { formatDate, formatTime } = useLocalization();

  return (
    <div>
      {/* Formats according to user's date format & timezone */}
      <span>{formatDate(action.scheduledDate)}</span>

      {/* Formats according to user's 12h/24h setting (e.g. "1:30pm" vs "13:30") */}
      <span>{formatTime(action.startTime)}</span>
    </div>
  );
}
```

### Hook API Reference:

| Property / Method     | Type                                         | Description                                                                       |
| :-------------------- | :------------------------------------------- | :-------------------------------------------------------------------------------- |
| `formatDate(date)`    | `(date: Date \| string \| number) => string` | Formats a date using active `date_format`, `timezone`, and `language`.            |
| `formatTime(time)`    | `(time: Date \| string \| number) => string` | Formats a time string (`HH:mm`) or Date using active `time_format`.               |
| `effectiveDateFormat` | `DateFormatType`                             | Resolved date format pattern (`"DD/MM/YYYY"`, `"MM/DD/YYYY"`, or `"YYYY/MM/DD"`). |
| `effectiveTimeFormat` | `TimeFormatType`                             | Resolved time format (`"12h"` or `"24h"`).                                        |
| `effectiveTimezone`   | `string`                                     | Resolved timezone ID (e.g., `"America/New_York"`).                                |
| `effectiveLanguage`   | `string`                                     | Resolved language code (e.g., `"en"`).                                            |
| `is24Hour`            | `boolean`                                    | `true` if `effectiveTimeFormat === "24h"`.                                        |
| `hourCycle`           | `"h12" \| "h23"`                             | Standard hour cycle prop for third-party calendars.                               |

---

## 3. Formatting Implementation Details

### A. Date Format Guarantee (`formatToParts`)

In standard browser `Intl.DateTimeFormat`, passing `{ day: "2-digit", month: "2-digit", year: "numeric" }` does **not** override field ordering because locale (e.g., `en-US`) dictates field order.

To guarantee field ordering regardless of browser defaults, [systemLocalization.ts](/apps/web/app/utils/systemLocalization.ts) uses `formatToParts()` to extract field parts in the target timezone and constructs the exact pattern requested:

- `DD/MM/YYYY` ➔ `31/12/2026`
- `MM/DD/YYYY` ➔ `12/31/2026`
- `YYYY/MM/DD` ➔ `2026/12/31`

### B. Time Format Standard (`12h` vs `24h`)

- Handles both string time formats (`"13:30"` ➔ `"1:30pm"` or `"13:30"`) and JavaScript `Date` objects.

---

## 4. Developer Guidelines: Inline vs Pre-calculation

| Use Case                      | Pattern                       | Example                                                                      |
| :---------------------------- | :---------------------------- | :--------------------------------------------------------------------------- |
| **Standard JSX Text**         | Inline in JSX                 | `{formatTime(action.startTime)}`                                             |
| **Multiple Attributes**       | Pre-calculate before `return` | `const label = formatDate(date); return <div title={label}>{label}</div>`    |
| **Complex String Formatting** | Pre-calculate before `return` | ``const range = `${formatDate(start)} – ${formatDate(end)}`; ``              |
| **Large Lists**               | Wrap in `useMemo`             | `useMemo(() => list.map(item => formatDate(item.date)), [list, formatDate])` |
