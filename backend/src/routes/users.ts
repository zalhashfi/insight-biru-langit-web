import { Hono } from 'hono';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const usersRouter = new Hono<{ Variables: { db: any, jwtPayload: any } }>();

usersRouter.get('/', async (c) => {
  const db = c.get('db');
  const payload = c.get('jwtPayload');
  
  if (payload?.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const allUsers = await db.select({
    id: users.id,
    email: users.email,
    fullName: users.fullName,
    role: users.role,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt
  }).from(users);
  
  return c.json({ users: allUsers }, 200);
});

usersRouter.post('/', async (c) => {
  const db = c.get('db');
  const payload = c.get('jwtPayload');
  
  if (payload?.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  let body;
  try {
    body = await c.req.json();
  } catch (e) {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  const { email, password, fullName, role } = body;
  
  if (!email || !password || !fullName) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  // TODO: Hash password properly in a real app
  const passwordHash = `hashed_${password}`;

  try {
    await db.insert(users).values({
      email,
      passwordHash,
      fullName,
      role: role || 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return c.json({ message: 'User created successfully' }, 201);
  } catch (error) {
    return c.json({ error: 'Error creating user' }, 500);
  }
});
