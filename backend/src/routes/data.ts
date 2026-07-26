import { Hono } from 'hono';
import { dataAqms, dataSoc } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const dataRouter = new Hono<{ Variables: { db: any, jwtPayload: any } }>();

const querySchema = z.object({
  stationUuid: z.string().uuid()
});

dataRouter.get('/aqms', zValidator('query', querySchema, (result, c) => {
  if (!result.success) {
    return c.json({ error: 'Validation failed', details: result.error.format() }, 400);
  }
}), async (c) => {
  const db = c.get('db');
  const { stationUuid } = c.req.valid('query');

  const data = await db.select().from(dataAqms)
    .where(eq(dataAqms.stationUuid, stationUuid))
    .orderBy(desc(dataAqms.measuredAt))
    .limit(100);
  
  return c.json({ data }, 200);
});

dataRouter.get('/soc', zValidator('query', querySchema, (result, c) => {
  if (!result.success) {
    return c.json({ error: 'Validation failed', details: result.error.format() }, 400);
  }
}), async (c) => {
  const db = c.get('db');
  const { stationUuid } = c.req.valid('query');

  const data = await db.select().from(dataSoc)
    .where(eq(dataSoc.stationUuid, stationUuid))
    .orderBy(desc(dataSoc.measuredAt))
    .limit(100);
  
  return c.json({ data }, 200);
});
