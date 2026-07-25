import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { iotRouter } from './routes/iot';
import { authRouter } from './routes/auth';
import { ticketRouter } from './routes/ticket';
import { logsRouter } from './routes/logs';
import { logger } from 'hono/logger';

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
}

const app = new Hono<{ Bindings: Bindings, Variables: { db: any } }>();

// Global Middleware
app.use('*', logger());

// Routes that don't need DB
app.route('/api/logs', logsRouter);

// Database middleware
app.use('*', async (c, next) => {
  if (c.env?.DATABASE_URL && !c.get('db')) {
    const connection = await mysql.createConnection(c.env.DATABASE_URL);
    const db = drizzle(connection);
    c.set('db', db);
  }
  await next();
});

// Routes
app.route('/api/iot', iotRouter);
app.route('/api/auth', authRouter);
app.route('/api/tickets', ticketRouter);

app.get('/', (c) => {
  return c.json({ message: 'Welcome to Biru Langit API' });
});

export default app;
