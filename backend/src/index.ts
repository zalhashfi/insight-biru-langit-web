import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { iotRouter } from './routes/iot';
import { authRouter } from './routes/auth';
import { ticketRouter } from './routes/ticket';
import { logsRouter } from './routes/logs';
import { logger } from 'hono/logger';

type Bindings = {
  HYPERDRIVE: any;
  JWT_SECRET: string;
}

const app = new Hono<{ Bindings: Bindings, Variables: { db: any } }>();

// Global Middleware
app.use('*', logger());

// Routes that don't need DB
app.route('/api/logs', logsRouter);

// Database middleware
app.use('*', async (c, next) => {
  if (c.env?.HYPERDRIVE && !c.get('db')) {
    try {
      const connection = await mysql.createConnection(c.env.HYPERDRIVE.connectionString);
      const db = drizzle(connection);
      c.set('db', db);
    } catch (error: any) {
      console.error('Database connection error:', error.message);
      return c.json({ error: 'Database connection failed', details: error.message }, 500);
    }
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
