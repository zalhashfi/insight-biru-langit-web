type LogLevel = 'info' | 'warn' | 'error';

/**
 * Sends a log message to the backend which will then be recorded
 * in Cloudflare Logs (via Hono logger and console output).
 * 
 * @param level Log severity level
 * @param message Description of the event
 * @param data Optional extra data (e.g. error stack, user id, action payload)
 */
export async function logToCloudflare(level: LogLevel, message: string, data?: any): Promise<void> {
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        level,
        message,
        data,
      }),
    });
  } catch (err) {
    // We intentionally swallow errors here so that logging doesn't break the main app flow
    console.error('Failed to send log to Cloudflare:', err);
  }
}
