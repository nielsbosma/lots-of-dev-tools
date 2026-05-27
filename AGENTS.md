# Agents

## Project Overview

A developer utilities web app with a retro terminal aesthetic. Vite + React + TypeScript + Tailwind CSS v4.

## Commands

- `npm run dev` — start dev server
- `npm run build` — type-check and production build
- `npm run test:run` — run all tests once
- `npm test` — run tests in watch mode
- `./Run.ps1` — find available port, start server, open browser

## Architecture

- `src/tools/registry.ts` — central tool registry. Every tool is registered here with an id, name, description, category, and lazy-loaded component.
- `src/tools/<tool-id>/` — each tool lives in its own folder:
  - `<tool-id>.logic.ts` — pure functions (no React, no side effects)
  - `<tool-id>.logic.test.ts` — unit tests for the pure logic
  - `<tool-id>.tsx` — React component (default export)
  - `<tool-id>.test.tsx` — component tests using @testing-library/react
- `src/components/ui/` — shared UI primitives (Button, Input, Textarea, Label)
- `src/components/layout/` — app shell (Layout, Sidebar)
- `src/pages/` — route-level pages (HomePage, ToolPage)
- `src/lib/utils.ts` — shared utilities (cn helper)

## Adding a New Tool

1. Create `src/tools/<tool-id>/`
2. Write pure logic in `<tool-id>.logic.ts`
3. Write logic tests in `<tool-id>.logic.test.ts`
4. Write the React component in `<tool-id>.tsx` (must be default export)
5. Write component tests in `<tool-id>.test.tsx`
6. Add one entry to `src/tools/registry.ts`

No other files need to change — routing, sidebar, and home page are all driven by the registry.

## Conventions

- Path alias: `@/` maps to `src/`
- All tool logic must be in separate `.logic.ts` files — keep React components thin
- Tests are required for both logic and components
- Use existing UI primitives from `src/components/ui/` rather than raw HTML
- Retro theme colors: `retro-green`, `retro-amber`, `retro-cyan`, `retro-magenta`, `retro-bg`, `retro-surface`, `retro-border`, `retro-text`, `retro-muted`
- Font for headings: `font-[family-name:var(--font-display)]`
- Error messages use `role="alert"` and `text-retro-magenta`

## Testing

- Framework: Vitest + jsdom + @testing-library/react
- Global test setup: `src/test/setup.ts`
- Test globals are enabled (no need to import `describe`, `it`, `expect`)
- Run `npm run test:run` to verify all tests pass before committing
