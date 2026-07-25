import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import { sign } from 'hono/jwt';
import * as bcrypt from 'bcryptjs';

export const authRouter = new Hono<{ Variables: { db: any }, Bindings: { JWT_SECRET: string } }>();

authRouter.post('/login', async (c) => {
  const db = c.get('db');
  let body;
  try {
    body = await c.req.json();
  } catch (e) {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  const { email, password } = body;
  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  const result = await db.select().from(users).where(eq(users.email, email));
  if (result.length === 0) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const user = result[0];

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const payload = {
    id: user.id,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours
  };

  const secret = c.env?.JWT_SECRET;
  if (!secret) {
    return c.json({ error: 'Server configuration error: missing JWT_SECRET' }, 500);
  }
  const token = await sign(payload, secret);

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    }
  }, 200);
});
