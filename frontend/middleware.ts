/**
 * Next.js Middleware — Route protection for the dashboard.
 *
 * All routes matching /dashboard/* require an active NextAuth session.
 * Unauthenticated users are redirected to /login with the original URL
 * preserved as the `callbackUrl` query parameter.
 */
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*"],
};
