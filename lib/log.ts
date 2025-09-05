const EMAIL_REGEX = /[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/g;

export function log(event: string, data: Record<string, unknown> = {}) {
  const sanitized = JSON.parse(
    JSON.stringify(data),
    (_key, value) =>
      typeof value === 'string' ? value.replace(EMAIL_REGEX, '[redacted]') : value,
  );
  // Structured logging
  const entry = { event, ...sanitized, timestamp: new Date().toISOString() };
  console.log(entry);
  if (typeof fetch !== 'undefined' && process.env.NEXT_PUBLIC_LOG_ENDPOINT) {
    try {
      fetch(process.env.NEXT_PUBLIC_LOG_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(entry),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      });
    } catch {
      // ignore network errors
    }
  }
}
