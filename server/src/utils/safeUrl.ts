// SSRF guard for outbound, user-supplied webhook URLs. Requires public HTTPS and
// rejects loopback / private / link-local / CGNAT / cloud-metadata destinations.
// Note: domain names that resolve to private IPs via public DNS are a residual
// risk (DNS rebinding); a follow-up can pin the resolved IP at fetch time. This
// blocks the common metadata/internal-IP and obvious internal-name cases.

function ipv4Disallowed(host: string): boolean {
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const o = m.slice(1).map(Number);
  if (o.some((n) => n > 255)) return true; // malformed → reject
  const [a, b] = o;
  if (a === 0 || a === 127) return true; // this-host / loopback
  if (a === 10) return true; // private
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true; // private
  if (a === 169 && b === 254) return true; // link-local + cloud metadata (169.254.169.254)
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  return false;
}

function ipv6Disallowed(host: string): boolean {
  const h = host.replace(/^\[|\]$/g, '').toLowerCase();
  if (h === '::1' || h === '::') return true; // loopback / unspecified
  if (h.startsWith('fc') || h.startsWith('fd')) return true; // unique-local fc00::/7
  if (h.startsWith('fe80')) return true; // link-local
  if (h.startsWith('::ffff:')) return true; // IPv4-mapped (defer to ipv4 check via the mapped form)
  return false;
}

/** True only for a public, https URL safe to fetch from the server. */
export function isPublicHttpsUrl(raw: string): boolean {
  let u: URL;
  try { u = new URL(raw); } catch { return false; }
  if (u.protocol !== 'https:') return false;
  const host = u.hostname.toLowerCase();
  if (!host) return false;
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal') || host === 'metadata.google.internal') return false;
  if (ipv4Disallowed(host)) return false;
  if (host.includes(':') && ipv6Disallowed(host)) return false;
  return true;
}
