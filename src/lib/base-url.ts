/** Builds this site's own absolute base URL from the incoming request — used for payment gateway redirect URLs, which must be absolute. */
export function getBaseUrl(req: Request): string {
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
