/**
 * Application Configuration
 * Centralized configuration management for the AI Translator app
 */

// API Configuration
export const API_CONFIG = {
  // Backend API base URL
  BASE_URL:
    "https://aitranslator-fae0f8bxegh8dkb4.newzealandnorth-01.azurewebsites.net",

  // API endpoints
  ENDPOINTS: {
    TRANSLATE: "/v1/translate",
    TURNSTILE_SITEKEY: "/_turnstile/sitekey",
  },

  // Request configuration
  REQUEST: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
  },
} as const;

// Translation Configuration
export const TRANSLATION_CONFIG = {
  // Character limits
  MAX_CHARACTERS: 5000,
  SOFT_LIMIT: 4000,

  // Text area configuration
  TEXTAREA: {
    MIN_ROWS: 4,
    MAX_ROWS: 15,
  },

  // Auto-save configuration
  AUTO_SAVE_DELAY: 1000, // milliseconds
} as const;

// Turnstile Configuration
export const TURNSTILE_CONFIG = {
  // Widget appearance
  THEME: "auto" as const, // 'light' | 'dark' | 'auto'
  SIZE: "normal" as const, // 'normal' | 'compact'

  // Security settings
  ACTION: "web-client",

  // Token management
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes in milliseconds
} as const;

// UI Configuration
export const UI_CONFIG = {
  // Layout breakpoints (matches Tailwind defaults)
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    "2XL": 1536,
  },

  // Animation durations
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },

  // Toast notifications
  TOAST: {
    DURATION: 5000, // milliseconds
    MAX_VISIBLE: 3,
  },

  // Theme
  THEME: {
    DEFAULT: "system" as const, // 'light' | 'dark' | 'system'
    STORAGE_KEY: "theme",
  },
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  // Enable/disable features
  ENABLE_VOICE_INPUT: false,
  ENABLE_FILE_UPLOAD: false,
  ENABLE_HISTORY: true,
  ENABLE_ANALYTICS: false,

  // Experimental features
  ENABLE_OFFLINE_MODE: false,
  ENABLE_PWA: false,
} as const;

// Development Configuration
export const DEV_CONFIG = {
  // Debug settings
  ENABLE_DEBUG_MODE: process.env.NODE_ENV === "development",
  ENABLE_CONSOLE_LOGS: process.env.NODE_ENV === "development",

  // Mock settings
  ENABLE_MOCK_API: false,
  MOCK_DELAY: 1000, // milliseconds
} as const;

// Helper functions for configuration access
export const getApiBaseUrl = (): string => {
  // Fallback to environment variable if needed
  return process.env.NEXT_PUBLIC_API_BASE || API_CONFIG.BASE_URL;
};

export const getFullApiUrl = (endpoint: string): string => {
  return `${getApiBaseUrl()}${endpoint}`;
};

// Type exports for better TypeScript support
export type ApiEndpoint = keyof typeof API_CONFIG.ENDPOINTS;
export type ThemeMode = typeof UI_CONFIG.THEME.DEFAULT;
export type TurnstileTheme = typeof TURNSTILE_CONFIG.THEME;
export type TurnstileSize = typeof TURNSTILE_CONFIG.SIZE;
