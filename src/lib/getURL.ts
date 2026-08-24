/**
 * Determines the correct base URL for the current environment.
 * Works across local dev, Vercel preview deployments, and production.
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL (manually set for production)
 * 2. NEXT_PUBLIC_VERCEL_URL (auto-set by Vercel on previews)
 * 3. http://localhost:3000 (local dev fallback)
 */
export function getURL(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    'http://localhost:3000/';

  // Ensure https:// prefix (NEXT_PUBLIC_VERCEL_URL doesn't include protocol)
  url = url.startsWith('http') ? url : `https://${url}`;
  // Ensure trailing slash
  url = url.endsWith('/') ? url : `${url}/`;

  return url;
}
