/**
 * Central API URL configuration.
 *
 * Priority:
 *   1. NEXT_PUBLIC_API_URL / API_URL  (set in .env.local → points to Render)
 *   2. Render backend URL             (hardcoded fallback so it works even if env missing)
 *   3. Local backend                  (last resort for dev without any env file)
 */

const RENDER_URL = "https://ideapulse-ai-startup-idea-generator.onrender.com/api/v1";

/**
 * Use this in CLIENT components and pages (browser-safe).
 * Baked-in at build time via NEXT_PUBLIC_* prefix.
 */
export const PUBLIC_API_URL: string =
  process.env.NEXT_PUBLIC_API_URL || RENDER_URL;

/**
 * Use this in SERVER-ONLY code (API routes, server components).
 * Not exposed to the browser.
 */
export const SERVER_API_URL: string =
  process.env.API_URL || RENDER_URL;
