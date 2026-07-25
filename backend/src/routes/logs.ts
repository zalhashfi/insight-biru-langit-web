import { Hono } from 'hono';

export const logsRouter = new Hono();

logsRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { level, message, data } = body;

    if (!level || !message) {
      return c.json({ success: false, error: 'Missing level or message' }, 400);
    }

    const prefix = `[FRONTEND_LOG - ${level}]`;

    switch (level) {
      case 'info':
        console.info(prefix, message, data);
        break;
      case 'error':
        console.error(prefix, message, data);
        break;
      case 'warn':
        console.warn(prefix, message, data);
        break;
      default:
        console.log(prefix, message, data);
        break;
    }

    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: 'Invalid payload' }, 400);
  }
});
