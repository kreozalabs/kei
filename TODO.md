# What if we do following:

Use database for settings.
use local storage for last saved state.
use session storage for session specific things that are configured outside settings, like locked or section expanded.

That is why theme should be changed only in settings, and not in header, so there is no friction there!

Also, we can fully remove recent configs logic and keep it settings specific. User should be able to configure those. Those are for example, duration_options(action_duration_options should we name it this way?), timezone_options (action_timezone_options should we name it this way?). Recent configs are calculated things, though how do we keep them simple, so it does not use much resources, but also helpful enough? Or should we just make recent configs to go to things like "duration_options", unless user has defined those himself?

## Questions

1. Use local storage for last saved state, for fast loading without dependency on DB, and when do loaded, then load from db and update local storage, and UI state too? or ignore UI state update?
2. Is there a point of DB for settings if we do not update state, like if UI will load faster than DB? It means settings will be used only on the next loads, and on next load for new device.
3. How do we store then things?
4. Do we add language setting? It will be nice reminder to develop multi language support later.
5. Is there something missing?

## PLAN

```md
# Settings Architecture & Implementation Plan

## 1. Core Architecture: Event-Sourced Settings

Instead of building separate CRUD logic for settings, we will leverage the existing Event Sourcing engine.

- **Unified Sync:** Settings changes will be pushed as standard events (e.g., `SETTING_UPDATED`).
- **Materialized View:** The `settings` database table will act as a fast-read snapshot/projection of these events, exactly like `actions_snapshot`.
- **Free Conflict Resolution:** By treating settings as events, cross-device synchronization and offline conflict resolution are handled automatically by the existing event log timestamps.

## 2. The Three-Tier Storage Strategy

We will use a "Stale-While-Revalidate" approach to balance instant load times with cross-device sync:

1. **Database (`settings` table):** The Global Source of Truth. Syncs across all of the user's devices.
2. **Local Storage (`localStorage`):** The "Fast Cache". The app boots instantly using these cached values (preventing UI flicker like theme flashes), then connects to the DB in the background to update the cache and live UI if the DB version is newer.
3. **Session Storage (`sessionStorage`):** For volatile, device-specific session overrides. (e.g., the user clicks "unlock timeline" on their desktop dashboard—this saves to `sessionStorage` so it doesn't permanently change their global setting or affect their mobile view).

## 3. UI & Feature Decisions

- **Theme Management:** Theme selection should live _only_ in the Settings page, not as a quick-toggle in the Header. This solidifies it as a global preference and reduces friction.
- **Distraction-Free Mode:** Add a toggle for the `useSubtleOnIdle` effect (which currently fades the AppHeader). While it creates a clean aesthetic, it can frustrate users who want constant access to navigation/search. Let the user explicitly opt-in or out.
- **Customizable Action Presets (Simple Mode):** Fully remove the complex "Recent Configs" calculation logic (scanning event logs). Replace it with user-defined presets in Settings.
  - Rename to `action_duration_options` (type: `{ label: string, value: [number, number] }[]`)
  - Rename to `action_timezone_options` (type: `string[]`)
- **Future-Proofing:** Add a `language` setting (default `'en'`) now to lay the groundwork for multi-language support (i18n) later.
```

## NOTES
- **Kill the 'Magic':** Removing the recent configs logic simplifies the database read path and makes the UI predictable. No more surprise re-ordering of dropdowns.
- **Types:** Durations will be stored as `[min, max]` tuples to support both fixed times and ranges.
