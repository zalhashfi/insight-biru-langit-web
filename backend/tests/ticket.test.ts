import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { ticketRouter } from '../src/routes/ticket';
import { sign } from 'hono/jwt';

const mockDb = {
  select: vi.fn(() => ({
    from: vi.fn().mockResolvedValue([
      { id: 1, stationId: 'st-1', status: 'open', description: 'Sensor mati' }
    ])
  })),
  update: vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn().mockResolvedValue([{ insertId: 1 }])
    }))
  })),
  insert: vi.fn(() => ({
    values: vi.fn().mockResolvedValue([{ insertId: 2 }])
  }))
};

describe('Ticket API', () => {
  let app: Hono;
  let token: string;

  beforeEach(async () => {
    app = new Hono();
    app.use('*', async (c, next) => {
      c.set('db', mockDb as any);
      c.env = { JWT_SECRET: 'super-secret' };
      await next();
    });
    // Add JWT middleware simulation
    app.use('*', async (c, next) => {
      const auth = c.req.header('Authorization');
      if (auth && auth.startsWith('Bearer ')) {
        // Mock valid user
        c.set('jwtPayload', { id: 'user-123', role: 'engineer' });
      } else {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      await next();
    });
    
    app.route('/api/tickets', ticketRouter);
    vi.clearAllMocks();

    token = await sign({ id: 'user-123', role: 'engineer' }, 'super-secret');
  });

  it('should list tickets for authenticated user', async () => {
    const res = await app.request('/api/tickets', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.tickets).toHaveLength(1);
    expect(body.tickets[0].status).toBe('open');
  });

  it('should update a ticket and add a maintenance log', async () => {
    const res = await app.request('/api/tickets/1', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'resolved',
        actionTaken: 'Replaced PM2.5 sensor'
      })
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe('Ticket updated successfully');

    expect(mockDb.update).toHaveBeenCalled();
    expect(mockDb.insert).toHaveBeenCalled(); // For maintenance_log
  });

  it('should reject unauthenticated requests', async () => {
    const res = await app.request('/api/tickets', {
      method: 'GET'
    });
    expect(res.status).toBe(401);
  });
});
