### Phase 1: App Loads (Natural Progress Movement)

1. Initialize Database: Connect local adapter (IndexedDB / Tauri SQLite).
2. Apply Migrations: Ensure schema matches current app version.
3. Rebuild Projections: Replay event log to construct active state.
4. Sanity Test: Perform instant local read/write assertion (SELECT 1).

### Phase 2: If Something Fails (Silent Self-Healing)

1. **Trigger Auto-Recovery**: Loader extends time smoothly (no scary red error text shown to user).
2. **Execute Problem-Specific Repair**:
   - **Multi-Tab / WASM Lock Conflict**: Detect lock collision $\rightarrow$ Switch tab to **Follower Mode** (proxy SQL queries via `BroadcastChannel` to Leader Tab).
   - **Connection Lock / Storage Busy**: Pause 200ms $\rightarrow$ Re-open storage adapter.
   - **Projection / State Out-of-Sync**: Purge local derived cache $\rightarrow$ Replay event log from sequence `0` (100% loss-less).
   - **Corrupted Event Record**: Quarantine invalid event to backup key $\rightarrow$ Resume pipeline with valid events.
   - **Schema Migration Mismatch**: Execute schema repair patch $\rightarrow$ Re-verify table structures.
   - **Storage Quota Exceeded**: Purge ephemeral cache/logs $\rightarrow$ If still full, ask user to free disk space.
   - **Sanity Test Failed**: Attempt secondary storage fallback (IndexedDB $\rightarrow$ In-Memory / LocalStorage wrapper).
3. **Max Retries (2 Attempts)**:
   - If repaired $\rightarrow$ Proceed to Phase 3 smoothly.
   - If all retries fail $\rightarrow$ Only then show minimal error UI with a single _"Retry"_ button (no technical jargon unless user opens _"Details"_).

### Phase 3: Loader Stops (App Launches)

0. UI & Queries Unlocked: App dashboard renders from local state.
1. P2P Sync Started: Listens for peer connections in background.
2. API Sync Started: Background sync pushes/pulls changes to cloud.

### Key Guiding Principles

- **Silent First:** Fix 99% of storage glitches automatically without bothering the user.
- **Zero Technical Jargon:** No raw stack traces or error codes on screen. Keep text minimal or rely purely on progress bar motion.
- **Zero Data Loss:** Auto-healing only purges derived cache, never the raw event log.

### Notes

It should contain as less text as possible. Error does not need to be displauyed to user, unless user needs it for something !!!

### Opinion

This is idea of loader for now. It is simple version with focus on local data first, and API later

Is it right? Something wrong/missing/incomplete?

## Natural Progress

It works as following:

1. one step is completed
2. Progress bar moves smoothly to next step as if it does 1% at at time.

## To develop app loader we need:

1. DB is ready function
2. migrations applied
3. projections rebuilt
4. sanity test performed
