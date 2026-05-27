# DEV_TOOLS

A collection of developer utilities with a retro terminal aesthetic. Built with Vite, React, TypeScript, Tailwind CSS, and Shadcn-style components.

## Tools

- **URL Encoder/Decoder** — Encode or decode URL components
- **Color Converter** — Convert colors between HEX, RGB, and HSL

## Getting Started

```powershell
npm install
./Run.ps1
```

Or manually:

```bash
npm run dev
```

## Testing

```bash
npm test        # watch mode
npm run test:run # single run
```

## Adding a New Tool

1. Create a folder under `src/tools/<tool-id>/`
2. Add your logic in `<tool-id>.logic.ts` (pure functions, easy to test)
3. Add tests in `<tool-id>.logic.test.ts`
4. Add the React component in `<tool-id>.tsx`
5. Add component tests in `<tool-id>.test.tsx`
6. Register it in `src/tools/registry.ts`

The sidebar, routing, and home page update automatically.
