import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { iotRouter } from './routes/iot';
import { authRouter } from './routes/auth';
import { ticketRouter } from './routes/ticket';
import { logsRouter } from './routes/logs';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';

type Bindings = {
  HYPERDRIVE: any;
  JWT_SECRET: string;
}

const app = new Hono<{ Bindings: Bindings, Variables: { db: any } }>();

// Global Middleware
app.use('*', secureHeaders());
app.use('*', logger());
app.use('*', cors({
  origin: (origin) => {
    // Restrict to production domains only. Localhost is not allowed for security reasons.
    // Local development should use Vite's proxy instead of relying on CORS.
    if (origin && (origin.endsWith('biru-langit.com') || origin.endsWith('pages.dev'))) {
      return origin;
    }
    // Default fallback to strict domain (or null to block)
    return 'https://insight.biru-langit.com';
  },
  credentials: true,
}));

// Routes that don't need DB
app.route('/api/logs', logsRouter);

// Database middleware
app.use('*', async (c, next) => {
  if (c.env?.HYPERDRIVE && !c.get('db')) {
    try {
      const connection = await mysql.createConnection({
        uri: c.env.HYPERDRIVE.connectionString,
        disableEval: true
      });
      const db = drizzle(connection);
      c.set('db', db);
    } catch (error: any) {
      console.error('Database connection error:', error.message);
      return c.json({ error: 'Database connection failed', details: error.message }, 500);
    }
  }
  await next();
});

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled Exception:', err);
  return c.json({
    error: 'Internal Server Error',
    message: err.message,
    cause: err.cause ? String(err.cause) : null,
    stack: err.stack,
    details: JSON.stringify(err, Object.getOwnPropertyNames(err))
  }, 500);
});

// Routes
app.route('/api/iot', iotRouter);
app.route('/api/auth', authRouter);
app.route('/api/tickets', ticketRouter);

app.get('/api', (c) => {
  return c.json({ message: 'Welcome to Biru Langit API' });
});

export default app;
