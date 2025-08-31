"use client"

import { useCallback, useRef, useState } from "react";
import { TURNSTILE_CONFIG } from "@/lib/config";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: any) => string | number;
      reset: (id?: string | number) => void;
    };
  }
}

export function useTurnstile() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [widgetId, setWidgetId] = useState<string | number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadScript = useCallback(() => {
    if (window.turnstile) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load Turnstile API"));
      document.head.appendChild(s);
    });
  }, []);

  const render = useCallback(
    async (siteKey: string, theme?: 'light' | 'dark' | 'auto') => {
      setLoading(true);
      try {
        await loadScript();
        if (!containerRef.current || !window.turnstile) return;
        containerRef.current.innerHTML = "";
        setToken(null);

        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action: TURNSTILE_CONFIG.ACTION,
          callback: (t: string) => {
            setToken(t || null);
            setLoading(false);
          },
          "expired-callback": () => {
            setToken(null);
            setLoading(false);
          },
          "error-callback": () => {
            setToken(null);
            setLoading(false);
          },
          theme: theme || TURNSTILE_CONFIG.THEME,
          size: TURNSTILE_CONFIG.SIZE,
        });
        setWidgetId(id);
        setReady(true);
      } catch (error) {
        console.error("Failed to render Turnstile:", error);
        setLoading(false);
      }
    },
    [loadScript]
  );

  const refresh = useCallback(() => {
    setToken(null);
    setLoading(true);
    if (window.turnstile && widgetId !== null) {
      window.turnstile.reset(widgetId);
    }
  }, [widgetId]);

  const isVerified = token !== null && !loading;

  return {
    containerRef,
    render,
    refresh,
    token,
    ready,
    loading,
    isVerified
  };
}
