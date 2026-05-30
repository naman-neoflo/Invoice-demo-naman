// lib/auth.ts
//
// Minimal session-cookie gate for the entire app. Behavior:
//   - middleware.ts checks every incoming request and redirects to
//     /login unless the session cookie is present + matches.
//   - /api/auth/login validates the username + password and sets the
//     cookie on success.
//   - /api/auth/logout clears the cookie.
//
// Credentials and the cookie token default to demo values so the app
// works out of the box; all three are overridable via env vars for
// rotation without code changes.

export const COOKIE_NAME = "neoflo_session"

/** Value the cookie must equal to be considered authenticated. */
export const SESSION_TOKEN = process.env.AUTH_SESSION_TOKEN ?? "ok-2026"

/** Public routes accessible without authentication. */
export const PUBLIC_PATHS = new Set<string>([
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/auto-login",
])

/** Path prefixes always allowed (static assets, Next internals). */
export const PUBLIC_PREFIXES = ["/_next/", "/favicon", "/public/"]

export function checkCredentials(
  username: string,
  password: string,
): boolean {
  const expectedUser = process.env.AUTH_USERNAME ?? "neoflo"
  const expectedPass = process.env.AUTH_PASSWORD ?? "n30fl0r0x0r!"
  return username === expectedUser && password === expectedPass
}

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
}
