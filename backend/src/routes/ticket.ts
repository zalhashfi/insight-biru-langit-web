import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { maintenanceTickets, maintenanceLog } from '../db/schema';

export const ticketRouter = new Hono<{ Variables: { db: any, jwtPayload: any } }>();

ticketRouter.get('/', async (c) => {
  const db = c.get('db');
  const payload = c.get('jwtPayload');
  
  if (!payload || (payload.role !== 'admin' && payload.role !== 'engineer')) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const tickets = await db.select().from(maintenanceTickets);
  return c.json({ tickets }, 200);
});

ticketRouter.post('/', async (c) => {
  const db = c.get('db');
  const payload = c.get('jwtPayload');
  
  if (!payload) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  let body;
  try {
    body = await c.req.json();
  } catch (e) {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  const { stationUuid, issueTitle, issueDescription } = body;
  
  if (!stationUuid || !issueTitle || !issueDescription) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  await db.insert(maintenanceTickets).values({
    stationUuid,
    reportedByUserId: payload.id,
    issueTitle,
    issueDescription,
    status: 'open',
    createdAt: new Date()
  });

  return c.json({ message: 'Ticket created successfully' }, 201);
});

ticketRouter.put('/:id', async (c) => {
  const db = c.get('db');
  const ticketId = parseInt(c.req.param('id'));
  const payload = c.get('jwtPayload');
  
  if (!payload || (payload.role !== 'admin' && payload.role !== 'engineer')) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const engineerId = payload.id;
  
  let body;
  try {
    body = await c.req.json();
  } catch (e) {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  const { status, actionTaken } = body;
  
  if (status) {
    const updateData: any = { status };
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }
    await db.update(maintenanceTickets)
      .set(updateData)
      .where(eq(maintenanceTickets.id, ticketId));
  }

  if (actionTaken && engineerId) {
    await db.insert(maintenanceLog).values({
      ticketId,
      engineerId,
      actionTaken,
      createdAt: new Date()
    });
  }

  return c.json({ message: 'Ticket updated successfully' }, 200);
});
