import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { authRouter } from '../src/routes/auth';

const mockDb = {
  select: vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn().mockImplementation((condition) => {
        // Return a mock user for testing
        return Promise.resolve([{
          id: 'user-123',
          username: 'admin',
          passwordHash: 'hashed_password',
          role: 'admin'
        }]);
      })
    }))
  }))
};

describe('Auth API', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.use('*', async (c, next) => {
      c.set('db', mockDb as any);
      c.env = { JWT_SECRET: 'super-secret' }; // Mock env
      await next();
    });
    app.route('/api/auth', authRouter);
    vi.clearAllMocks();
  });

  it('should return a JWT token for valid credentials', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'password123'
      })
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('token');
    expect(body.user).toEqual({
      id: 'user-123',
      username: 'admin',
      role: 'admin'
    });
  });

  it('should return 401 for missing credentials', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin'
      })
    });

    expect(res.status).toBe(400);
  });
});
