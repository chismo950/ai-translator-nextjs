# Repository Guidelines

## Project Structure & Module Organization
- `src/app/`: Next.js App Router (`layout.tsx`, `page.tsx`, `globals.css`).
- `src/components/`: UI and feature components; shadcn/ui in `src/components/ui/`.
- `src/hooks/`: Reusable hooks (e.g., `useTurnstile.tsx`, `useLanguage.tsx`).
- `src/lib/`: Configuration, API client, i18n, and utilities.
- `public/`: Static assets. Build artifacts live in `.next/` (ignored).

## Build, Test, and Development Commands
- `pnpm dev`: Run the local dev server with Turbopack at `http://localhost:3000`.
- `pnpm build`: Production build (uses Turbopack) to `.next/`.
- `pnpm start`: Start the production server from the build output.
- `pnpm lint`: Lint TypeScript/React code using Next.js ESLint config.

## Coding Style & Naming Conventions
- **Language**: TypeScript + React 19 on Next.js 15 (App Router).
- **Styling**: Tailwind CSS v4 with `clsx`/`class-variance-authority` for variants.
- **Indentation**: 2 spaces; avoid trailing whitespace and unused imports.
- **Files**: Components use kebab-case (e.g., `translator.tsx`); hooks use camelCase prefixed with `use` (e.g., `useTurnstile.tsx`).
- **Imports**: Prefer absolute `@/` paths for `src` where configured.
- **Linting**: Keep `eslint` clean; config is in `eslint.config.mjs`.

## Testing Guidelines
- No test runner is configured yet. If adding tests, colocate as `*.test.ts(x)` near source files and prefer React Testing Library for components.
- Aim to cover: translation flow in `translator.tsx`, API client logic in `src/lib/apiClient.ts`, and language switching in `src/hooks/useLanguage.tsx`.
- Example future scripts: `"test": "vitest run"`, `"test:ui": "playwright test"`.

## Commit & Pull Request Guidelines
- **Commits**: Use Conventional Commits where possible:
  - Examples: `feat(translator): persist language selection`, `fix(ui): correct textarea padding`, `docs(readme): add deployment notes`.
- **PRs**: Provide a clear description, link related issues, include screenshots/GIFs for UI changes, and list testing steps. Ensure `pnpm build` and `pnpm lint` pass.

## Security & Configuration Tips
- Do not commit secrets. Keep Turnstile secrets on the backend.
- App configuration is centralized in `src/lib/config.ts` (e.g., `API_CONFIG.BASE_URL`). Use a local URL for dev and your deployed API in production.
- Ensure backend CORS allows the frontend origin; avoid storing sensitive tokens in the browser.

