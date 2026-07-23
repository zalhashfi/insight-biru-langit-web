import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { iotRouter } from '../src/routes/iot';

// Mock DB
const mockDb = {
  insert: vi.fn(() => ({
    values: vi.fn().mockResolvedValue([{ insertId: 1 }])
  })),
  select: vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn().mockResolvedValue([{ id: 'station-123', apiKey: 'valid-api-key' }])
    }))
  }))
};

describe('IoT Ingestion API', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    // Inject mock DB into context
    app.use('*', async (c, next) => {
      c.set('db', mockDb as any);
      await next();
    });
    app.route('/api/iot', iotRouter);
    vi.clearAllMocks();
  });

  it('should accept valid telemetry data and insert into both raw and hot paths', async () => {
    const payload = {
      pm25: 45,
      humidity: 60,
      temperature: 32
    };

    const res = await app.request('/api/iot/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'valid-api-key'
      },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ message: 'Data ingested successfully' });

    // Ensure db.insert was called (once for raw, once for telemetry)
    expect(mockDb.insert).toHaveBeenCalledTimes(2);
  });

  it('should reject invalid pm25 (e.g., > 1000) for hot path, but still save to raw path', async () => {
    const payload = {
      pm25: 1500, // Invalid PM2.5
      humidity: 60,
      temperature: 32
    };

    const res = await app.request('/api/iot/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'valid-api-key'
      },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200); // Still 200 because it's accepted by system
    
    // Ensure db.insert was called ONLY for raw sensor log (once)
    expect(mockDb.insert).toHaveBeenCalledTimes(1);
  });

  it('should reject requests without API key', async () => {
    const res = await app.request('/api/iot/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pm25: 10 })
    });

    expect(res.status).toBe(401);
  });
});
