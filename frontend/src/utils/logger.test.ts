import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logToCloudflare } from './logger';

describe('logToCloudflare', () => {
  let fetchMock: any;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });
    global.fetch = fetchMock;
  });

  it('should send a POST request with info level', async () => {
    await logToCloudflare('info', 'User viewed dashboard', { path: '/dashboard' });
    
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        level: 'info',
        message: 'User viewed dashboard',
        data: { path: '/dashboard' }
      })
    });
  });

  it('should send a POST request with error level', async () => {
    await logToCloudflare('error', 'API failed');
    
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/logs', expect.objectContaining({
      body: JSON.stringify({
        level: 'error',
        message: 'API failed'
      })
    }));
  });

  it('should handle fetch failures gracefully without throwing', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    
    // Should not throw
    await expect(logToCloudflare('info', 'test')).resolves.not.toThrow();
  });
});
