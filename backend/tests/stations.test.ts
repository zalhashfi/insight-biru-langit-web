import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { stationsRouter } from '../src/routes/stations';

const mockDb = {
  select: vi.fn(() => ({
    from: vi.fn().mockResolvedValue([
      { uuid: 'station-123', name: 'Station 1', type: 'aqms', isActive: true }
    ])
  })),
  insert: vi.fn(() => ({
    values: vi.fn().mockResolvedValue([{ insertId: 1 }])
  }))
};

describe('Stations API', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.use('*', async (c, next) => {
      c.set('db', mockDb as any);
      await next();
    });

    // Simulate admin authorization
    app.use('*', async (c, next) => {
      c.set('jwtPayload', { id: 1, role: 'admin' });
      await next();
    });

    app.route('/api/stations', stationsRouter);
    vi.clearAllMocks();
  });

  it('should list all stations', async () => {
    const res = await app.request('/api/stations', { method: 'GET' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.stations).toHaveLength(1);
    expect(body.stations[0].uuid).toBe('station-123');
  });

  it('should create a new station', async () => {
    const res = await app.request('/api/stations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Station 2',
        projectName: 'Biru Langit',
        type: 'soc',
        latitude: -6.200000,
        longitude: 106.816666
      })
    });
    expect(res.status).toBe(201);
    expect(mockDb.insert).toHaveBeenCalled();
  });
});
