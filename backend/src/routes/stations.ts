import { Hono } from 'hono';
import { station } from '../db/schema';
import { eq } from 'drizzle-orm';

export const stationsRouter = new Hono<{ Variables: { db: any, jwtPayload: any } }>();

stationsRouter.get('/', async (c) => {
  const db = c.get('db');
  
  const allStations = await db.select().from(station);
  
  return c.json({ stations: allStations }, 200);
});

stationsRouter.post('/', async (c) => {
  const db = c.get('db');
  const payload = c.get('jwtPayload');
  
  if (payload?.role !== 'admin' && payload?.role !== 'engineer') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  let body;
  try {
    body = await c.req.json();
  } catch (e) {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  const { uuid, name, type, latitude, longitude, apiKey, projectName } = body;
  
  if (!uuid || !name || !type || !apiKey) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  try {
    await db.insert(station).values({
      uuid,
      name,
      type,
      latitude,
      longitude,
      apiKey,
      projectName,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return c.json({ message: 'Station created successfully' }, 201);
  } catch (error) {
    return c.json({ error: 'Error creating station' }, 500);
  }
});
