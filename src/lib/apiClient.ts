// API client with Turnstile pass management
let passToken: string | null = null;

export function setPass(token: string | null) {
  passToken = token || null;
}

export function clearPass() {
  passToken = null;
}

export function getPass() {
  return passToken;
}

function getApiBase(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  if (apiBase) return apiBase;
  return "http://localhost:8080";
}

/**
 * GET /_turnstile/sitekey
 */
export async function getTurnstileSiteKey(): Promise<{
  siteKey: string;
  headerName: string;
}> {
  const base = getApiBase();
  const res = await fetch(`${base}/_turnstile/sitekey`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Turnstile site key: ${res.status}`);
  }

  return res.json();
}

/**
 * POST /v1/translate (pass-aware)
 */
export async function postTranslate(
  body: { text: string; sourceLang: string | null; targetLang: string },
  opts: {
    turnstileHeaderName: string; // e.g., "CF-Turnstile-Token"
    getTurnstileToken: () => string | null; // provide current Turnstile token (if any)
  }
) {
  const base = getApiBase();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Prefer server-issued pass
  if (passToken) {
    headers["X-Turnstile-Pass"] = passToken;
  } else {
    // Fall back to Turnstile token
    const t = opts.getTurnstileToken();
    if (t) headers[opts.turnstileHeaderName || "CF-Turnstile-Token"] = t;
  }

  const res = await fetch(`${base}/v1/translate`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    credentials: "include", // or "omit" if you do not use cookies
  });

  // Capture new pass if server issued one
  const issued = res.headers.get("X-Turnstile-Pass");
  if (issued) setPass(issued);

  if (res.status === 400 || res.status === 403) {
    clearPass(); // invalid/expired pass or token
    const err = await res.json().catch(() => ({}));
    const msg = (err && (err.title || err.detail)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(errorText);
  }

  return res.json(); // { sourceLang, targetLang, translatedText }
}

export interface TranslationResponse {
  sourceLang: string;
  targetLang: string;
  translatedText: string;
}
