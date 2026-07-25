import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { iotRouter } from './routes/iot';
import { authRouter } from './routes/auth';
import { ticketRouter } from './routes/ticket';
import { usersRouter } from './routes/users';
import { stationsRouter } from './routes/stations';
import { dataRouter } from './routes/data';
import { logsRouter } from './routes/logs';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { jwt } from 'hono/jwt';

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
  
  // In production, do not leak error details
  return c.json({
    error: 'Internal Server Error'
  }, 500);
});

// Custom middleware to access env variables for JWT
const jwtAuth = async (c: any, next: any) => {
  const secret = c.env?.JWT_SECRET;
  if (!secret) {
    return c.json({ error: 'Server configuration error' }, 500);
  }
  const jwtMiddleware = jwt({ secret });
  return jwtMiddleware(c, next);
};

app.use('/api/tickets/*', jwtAuth);
app.use('/api/users/*', jwtAuth);
app.use('/api/stations/*', jwtAuth);
app.use('/api/data/*', jwtAuth);

// Routes
app.route('/api/iot', iotRouter);
app.route('/api/auth', authRouter);
app.route('/api/tickets', ticketRouter);
app.route('/api/users', usersRouter);
app.route('/api/stations', stationsRouter);
app.route('/api/data', dataRouter);

app.get('/api', (c) => {
  return c.json({ message: 'Welcome to Biru Langit API' });
});

export default app;
