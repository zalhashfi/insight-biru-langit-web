import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { maintenanceTicket, maintenanceLog } from '../db/schema';

export const ticketRouter = new Hono<{ Variables: { db: any, jwtPayload: any } }>();

ticketRouter.get('/', async (c) => {
  const db = c.get('db');
  const tickets = await db.select().from(maintenanceTicket);
  return c.json({ tickets }, 200);
});

ticketRouter.put('/:id', async (c) => {
  const db = c.get('db');
  const ticketId = parseInt(c.req.param('id'));
  
  let body;
  try {
    body = await c.req.json();
  } catch (e) {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  const { status, actionTaken } = body;
  
  if (status) {
    await db.update(maintenanceTicket)
      .set({ status })
      .where(eq(maintenanceTicket.id, ticketId));
  }

  if (actionTaken) {
    await db.insert(maintenanceLog).values({
      ticketId,
      actionTaken,
      timestamp: new Date()
    });
  }

  return c.json({ message: 'Ticket updated successfully' }, 200);
});
