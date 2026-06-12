# Changelog

## [1.2.0](https://github.com/kreozalabs/kei/compare/@kreozalabs/kei-web-v1.1.0...@kreozalabs/kei-web-v1.2.0) (2026-06-12)


### Features

* add db activity indicator in header ([b13c042](https://github.com/kreozalabs/kei/commit/b13c042c58de0a8a6212c5b667028f07747e11f5))
* add setting to toggle visibility of default energy badge on action items ([948cee3](https://github.com/kreozalabs/kei/commit/948cee38bbbd2840077ea07d6b4534bf1cca9d1e))
* implement system settings telemetry dashboard ([29cf183](https://github.com/kreozalabs/kei/commit/29cf1835aaaf7cbd37db8b5bfe01f3f9456f6bda))
* optimize intention inputs and mobile spacing ([c44ac89](https://github.com/kreozalabs/kei/commit/c44ac896690cbb1555ceaba8b4f69c20588253a9))
* optimize task ordering and reschedule workflow ([458ec85](https://github.com/kreozalabs/kei/commit/458ec85b3eeaa04e793dda53f47b0ce16899a163))
* stabilize bulk selection layout and enhance task hover preview ([3808cea](https://github.com/kreozalabs/kei/commit/3808ceae392962de2ecbff452461f8b84ed54fc2))
* style and standardize sonner toast notifications ([49a77b9](https://github.com/kreozalabs/kei/commit/49a77b9418ee909a8fa6e2771a90dd3f67b1aab6))


### Bug Fixes

* preserve task duration range when assigning start and end times ([b918605](https://github.com/kreozalabs/kei/commit/b918605cd8640468bd28afc7a61daa9bbe9f1980))
* resolve mobile and desktop layouts in system settings component ([2aa64f9](https://github.com/kreozalabs/kei/commit/2aa64f9e8038ba358aae47745867531f97f1ec79))
* update configs to enable offline-mode ([0e3f281](https://github.com/kreozalabs/kei/commit/0e3f28100a527db8c2d1124133df949b1bc2b488))
* update Github icon import to GitHub in SystemSettings component ([27d17a8](https://github.com/kreozalabs/kei/commit/27d17a8f16b8505cc2a3152872706b10073cfb60))

## [1.1.0](https://github.com/kreozalabs/kei/compare/@kreozalabs/kei-web-v1.0.0...@kreozalabs/kei-web-v1.1.0) (2026-06-05)

### Features

- add setting to show or hide completed actions ([82eb86e](https://github.com/kreozalabs/kei/commit/82eb86ed2595b45a71761f1950317765d295efe3))
- add toggles for multi-select and selection hover animation ([17af09b](https://github.com/kreozalabs/kei/commit/17af09b791fc39679ec2cbafbc576d7fe3483358))
- implement high-performance event data export and import ([80ef369](https://github.com/kreozalabs/kei/commit/80ef369445dafa159070423955944b5fdde4b902))
- implement p2p sync ([5da37c4](https://github.com/kreozalabs/kei/commit/5da37c434a988e13c734d8a7534a940bb3f3f913))
- implement sequence numbering and arrow-based reordering ([b09b3c1](https://github.com/kreozalabs/kei/commit/b09b3c1657671af42da104969d0f5cf13dd6d351))

### Bug Fixes

- default new task sort order to place them at bottom ([00dcca1](https://github.com/kreozalabs/kei/commit/00dcca1508a221c10be5c412006079a9d3298c96))
- support bulk reactivate when all selected actions are completed ([dd79da9](https://github.com/kreozalabs/kei/commit/dd79da961bc352fcbf955ba860287831a83abdeb))
- update redirects target to avoid cloudflare pages clean url redirect ([ea86afd](https://github.com/kreozalabs/kei/commit/ea86afdae2cfb988790116fa032e3e10cc147ddd))
- update wrong changelog paths ([6816bcf](https://github.com/kreozalabs/kei/commit/6816bcfa520a8ee3f27fc8806498a286aaf52ebb))

### Performance Improvements

- optimize optimistic updates and consolidate database transactions ([cde139f](https://github.com/kreozalabs/kei/commit/cde139f3137c866e4c7fb07efe6aee414203812b))

## [1.0.0](https://github.com/kreozalabs/kei/compare/@kreozalabs/kei-web-v0.1.0...@kreozalabs/kei-web-v1.0.0) (2026-05-26)

### Features

- action lifecycle and interaction ux refinements ([76d542e](https://github.com/kreozalabs/kei/commit/76d542e12d7fdb14faca542160cc1eb39610e4ac))
- add bulk actions, optimistic updates, and undo toasts ([9dba1b0](https://github.com/kreozalabs/kei/commit/9dba1b0bd8ca39ad3a1d8fb492bcd5cd7f12d72a))
- add comprehensive pre-commit and autofix.ci action ([74f6c75](https://github.com/kreozalabs/kei/commit/74f6c754be9a970b1032a8f2b09a7615f7ffb4d6))
- add maintenance rebuild settings, implement dynamic page titles, and persist selected dashboard date across sessions ([993904e](https://github.com/kreozalabs/kei/commit/993904ec714fd6c39958ecaba505e0caf1bea9b4))
- add maskable PWA branding and offline WASM caching ([09386db](https://github.com/kreozalabs/kei/commit/09386db85f37c9552e2dec5a0feaeb26828d8a1b))
- Create core of Kei's structure and UI ([#1](https://github.com/kreozalabs/kei/issues/1)) ([143b2b7](https://github.com/kreozalabs/kei/commit/143b2b78a256459a2eb8c0cf378817bb7b399a43))
- Event Sourcing, Cross-Tab Sync, and Architectural Modularization ([#7](https://github.com/kreozalabs/kei/issues/7)) ([5c76c99](https://github.com/kreozalabs/kei/commit/5c76c99f08f4c83e9057c2ba768db4a423ebf98d))
- implement centralized persistent settings and enhanced experience customization ([#8](https://github.com/kreozalabs/kei/issues/8)) ([67a28e8](https://github.com/kreozalabs/kei/commit/67a28e8ffb6f9de39e5253476ba7ad09dd3cfc04))
- implement DbProvider context for centralized database initialization and error handling ([9b23350](https://github.com/kreozalabs/kei/commit/9b23350016efce3eb34c77c6f50930bdb085578e))
- Implement dual time format support and codebase refactor ([#3](https://github.com/kreozalabs/kei/issues/3)) ([a31c5da](https://github.com/kreozalabs/kei/commit/a31c5dac9abda850e0bbf1c30921a60670e5f488))
- prepare web app for deployment ([a164f5d](https://github.com/kreozalabs/kei/commit/a164f5d4c0718b2368d04f90eee57d2ebbf7a4ac))

### Bug Fixes

- optimize pwa precaching and remove redundant redirects ([3b83fa7](https://github.com/kreozalabs/kei/commit/3b83fa7217006163650359c9b3665fd99bddd0de))

### Miscellaneous Chores

- revert versions to 0.1.0 and force 1.0.0 release ([7df6ac2](https://github.com/kreozalabs/kei/commit/7df6ac2c2618f801d187f245f5d34f5c253f4cb3))
