# Life OS

A personal life management platform. Provides an extensible shell (auth, navigation, design system, app shell) that plugins fill with domain-specific features.

## Language

**Plugin**:
An independently developed feature module that owns its own database schema, routes, and domain logic. Plugins live under `src/modules/`. One plugin never reads another plugin's tables directly — cross-plugin data access goes through a service layer or domain events.

**Core**:
The shared foundation of the platform. Owns auth (Clerk), the app shell (Mantine AppShell), design tokens, navigation configuration, the shared database client, and cross-cutting concerns (logging, error handling, permissions). Core never depends on any plugin.

**Module**:
The physical directory under `src/modules/` where a Plugin's code lives. Every Plugin is a Module; not every Module is necessarily a Plugin (e.g. `src/modules/shared/` is cross-cutting, not a Plugin).

**User**:
A person who authenticates with Clerk and owns their data. `userId` is the Clerk user ID string (`auth().userId`). There is no local `users` table — Clerk is the identity source of truth. Every data row across all plugins is scoped to this `userId`.

*Avoid*: Account, customer, member

**Timeline Event**:
A life event with a date. Can be past (birth, started career) or future (vacation, deadline). Past/future is computed from `eventDate`, never stored. Every event is scoped to a `userId`.

**Category**:
A fixed enum on timeline events: `personal`, `career`, `education`, `health`, `finance`, `travel`, `relationships`, `business`, `entertainment`, `custom`.

**Importance**:
A fixed enum on timeline events: `critical`, `high`, `medium`, `low`.

**Recurrence**:
A fixed enum on timeline events: `none`, `daily`, `weekly`, `monthly`, `yearly`. Defines how the event repeats after its initial `eventDate`. For past events with recurring, the "next occurrence" is computed on-the-fly by adding the recurrence period from `eventDate` until a future date is reached. No instance rows are stored.

**Life Timeline** (aka "Timeline"):
The plugin at `src/modules/timeline/`. Database table is `timeline_events`. Route is `/timeline`. Feature ID is `timeline`. This is the user-facing name "Life Timeline" internally shortened to `timeline`.

## Example dialogue

**Dev**: I need to add a priority field to Tasks. Where's the schema?
**Domain expert**: In `src/modules/tasks/schema.ts`. Tasks Plugin owns its tables.
**Dev**: And if Habits needs to reference task priorities for the focus mode feature?
**Domain expert**: Habits queries Tasks through the Tasks service layer, never directly. Tasks exposes a `getTaskPriority(taskId)` method.
**Dev**: What if I need to add a new Plugin?
**Domain expert**: Create a directory in `src/modules/`, register your routes with the core, and own your schema. Done.
