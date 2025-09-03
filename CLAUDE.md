# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `pnpm dev` or `npm run dev` (uses Turbopack for faster builds)
- **Production build**: `pnpm build` or `npm run build` (uses Turbopack)
- **Production server**: `pnpm start` or `npm run start`
- **Linting**: `pnpm lint` or `npm run lint` (uses ESLint v9)
- **Package manager**: This project uses `pnpm` as the primary package manager

## Architecture Overview

This is a Next.js 15 AI translation frontend with App Router architecture. Key architectural patterns:

### Core Architecture
- **Framework**: Next.js 15 with App Router, TypeScript, Tailwind CSS v4
- **UI Components**: shadcn/ui components with Radix UI primitives
- **State Management**: React hooks with context providers for global state
- **API Communication**: Custom API client with Cloudflare Turnstile integration

### Key Components Structure
- **Centralized Configuration**: All app settings consolidated in `src/lib/config.ts`
- **API Client**: `src/lib/apiClient.ts` handles backend communication with pass-based authentication
- **Provider Architecture**: Theme, Language, and Toast providers wrapped in root layout
- **Hook-based Logic**: Custom hooks for Turnstile (`useTurnstile`), language switching (`useLanguage`), and toasts

### Backend Integration
The frontend expects a backend API with these endpoints:
- `GET /_turnstile/sitekey` - Returns Turnstile configuration
- `POST /v1/translate` - Translation endpoint with Turnstile token/pass verification

### Authentication Flow
Uses Cloudflare Turnstile with a pass-based system:
1. User completes Turnstile challenge
2. Backend issues a short-lived pass token
3. Subsequent requests use the pass instead of Turnstile tokens
4. Pass stored in memory only (not localStorage) for security

### Internationalization
- Multi-language UI support via `src/lib/i18n.ts`
- Language state managed through `LanguageProvider`
- Automatic system language detection

### Configuration Management
All settings centralized in `src/lib/config.ts`:
- `API_CONFIG` - Backend URLs and timeouts
- `TRANSLATION_CONFIG` - Character limits and UI settings
- `TURNSTILE_CONFIG` - Security widget configuration
- `FEATURE_FLAGS` - Enable/disable features
- Environment variable override support via `getApiBaseUrl()`

### Component Patterns
- Auto-resizing textarea with character counting
- Theme-aware components using next-themes
- Toast notifications for user feedback
- Language selector with flag icons

## Important Files
- `src/lib/config.ts` - Central configuration (modify API URLs here)
- `src/lib/apiClient.ts` - Backend communication logic
- `src/hooks/useTurnstile.tsx` - Cloudflare Turnstile integration
- `src/hooks/useLanguage.tsx` - Multi-language support
- `src/app/layout.tsx` - Provider setup and global configuration