import { Hono } from 'hono';
import { dataAqms, dataSoc } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export const dataRouter = new Hono<{ Variables: { db: any, jwtPayload: any } }>();

dataRouter.get('/aqms', async (c) => {
  const db = c.get('db');
  const stationUuid = c.req.query('stationUuid');

  if (!stationUuid) {
    return c.json({ error: 'Missing stationUuid query parameter' }, 400);
  }

  const data = await db.select().from(dataAqms)
    .where(eq(dataAqms.stationUuid, stationUuid))
    .orderBy(desc(dataAqms.timestamp))
    .limit(100);
  
  return c.json({ data }, 200);
});

dataRouter.get('/soc', async (c) => {
  const db = c.get('db');
  const stationUuid = c.req.query('stationUuid');

  if (!stationUuid) {
    return c.json({ error: 'Missing stationUuid query parameter' }, 400);
  }

  const data = await db.select().from(dataSoc)
    .where(eq(dataSoc.stationUuid, stationUuid))
    .orderBy(desc(dataSoc.timestamp))
    .limit(100);
  
  return c.json({ data }, 200);
});
