import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { station, rawSensorLog, telemetryData, firmwareVersion } from '../db/schema';

export const iotRouter = new Hono<{ Variables: { db: any } }>();

iotRouter.post('/ingest', async (c) => {
  const db = c.get('db');
  const apiKey = c.req.header('x-api-key');

  if (!apiKey) {
    return c.json({ error: 'API Key is required' }, 401);
  }

  // Find station by API Key
  const stations = await db.select().from(station).where(eq(station.apiKey, apiKey));
  if (stations.length === 0) {
    return c.json({ error: 'Invalid API Key' }, 401);
  }
  
  const currentStation = stations[0];
  
  let payload: any;
  try {
    payload = await c.req.json();
  } catch (e) {
    return c.json({ error: 'Invalid JSON payload' }, 400);
  }

  const { pm25, humidity, temperature } = payload;

  // 1. Insert into Cold Path (raw_sensor_log)
  await db.insert(rawSensorLog).values({
    stationIdRaw: currentStation.id,
    pm25,
    humidity,
    temperature,
    rawPayload: payload,
    status: 'processed'
  });

  // 2. Validate for Hot Path
  // Business logic: PM2.5 must be between 0 and 1000 to be considered valid for analytics
  const isValidPm25 = pm25 !== undefined && pm25 > 0 && pm25 < 1000;

  if (isValidPm25) {
    await db.insert(telemetryData).values({
      stationId: currentStation.id,
      pm25,
      humidity,
      temperature,
      isValid: true,
      recordedAt: new Date()
    });
  }

  return c.json({ message: 'Data ingested successfully' }, 200);
});

iotRouter.get('/ota', async (c) => {
  const db = c.get('db');
  const apiKey = c.req.header('x-api-key');
  const currentVersion = c.req.query('current_version');

  if (!apiKey) {
    return c.json({ error: 'API Key is required' }, 401);
  }

  // Find station by API Key
  const stations = await db.select().from(station).where(eq(station.apiKey, apiKey));
  if (stations.length === 0) {
    return c.json({ error: 'Invalid API Key' }, 401);
  }
  
  const currentStation = stations[0];

  // Update current station firmware version if provided
  if (currentVersion && currentVersion !== currentStation.firmwareVersion) {
    await db.update(station)
      .set({ firmwareVersion: currentVersion })
      .where(eq(station.id, currentStation.id));
  }

  // Get latest firmware version
  const latestVersions = await db.select()
    .from(firmwareVersion)
    .orderBy(desc(firmwareVersion.createdAt))
    .limit(1);

  if (latestVersions.length > 0) {
    const latest = latestVersions[0];
    if (latest.versionTag !== currentVersion) {
      return c.json({
        update_available: true,
        latest_version: latest.versionTag,
        github_url: latest.githubUrl
      }, 200);
    }
  }

  return c.json({
    update_available: false,
    latest_version: currentVersion || 'unknown'
  }, 200);
});
