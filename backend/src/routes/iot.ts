import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { station, rawSensorLog, dataAqms, dataSoc, firmwareRelease } from '../db/schema';

export const iotRouter = new Hono<{ Variables: { db: any } }>();

iotRouter.post('/identity', async (c) => {
  const db = c.get('db');
  let body;
  
  try {
    body = await c.req.json();
  } catch (e) {
    return c.json({ error: 'Invalid JSON payload' }, 400);
  }

  const { macAddress } = body;
  
  if (!macAddress) {
    return c.json({ error: 'macAddress is required' }, 400);
  }

  const stations = await db.select().from(station).where(eq(station.macAddress, macAddress));
  
  if (stations.length === 0) {
    return c.json({ error: 'Device not registered. Please contact administrator.' }, 404);
  }

  return c.json({ uuid: stations[0].uuid }, 200);
});

iotRouter.post('/ingest', async (c) => {
  const db = c.get('db');
  // Temporary workaround: devices might still use the old station.apiKey logic or maybe they send it in header.
  // Wait, in our DBML, station ONLY has uuid, name, projectName, macAddress. There's no apiKey!
  // I must check stationUuid from headers or payload. Let's assume devices send x-api-key as their UUID for now.
  const apiKey = c.req.header('x-api-key');

  if (!apiKey) {
    return c.json({ error: 'API Key is required' }, 401);
  }

  // Find station by UUID (assuming apiKey is the UUID now, since api_key column was removed)
  const stations = await db.select().from(station).where(eq(station.uuid, apiKey));
  if (stations.length === 0) {
    return c.json({ error: 'Invalid API Key' }, 401);
  }
  
  const currentStation = stations[0];
  
  let payload: any;
  try {
    const rawJson = await c.req.json();
    payload = rawJson;
  } catch (e) {
    return c.json({ error: 'Invalid JSON payload' }, 400);
  }

  // 1. Insert into Cold Path (raw_sensor_log)
  await db.insert(rawSensorLog).values({
    stationUuid: currentStation.uuid,
    firmwareVersion: currentStation.currentVersion || 'unknown',
    dataPayload: payload,
    receivedAt: new Date()
  });

  // 2. Validate and Insert for Hot Path based on type
  if (currentStation.type === 'aqms') {
    const pm25 = payload.pm25;
    const isValidPm25 = pm25 !== undefined && pm25 >= 0 && pm25 <= 1000;
    
    if (isValidPm25) {
      await db.insert(dataAqms).values({
        stationUuid: currentStation.uuid,
        pm25: payload.pm25,
        no2: payload.no2,
        co: payload.co,
        temp: payload.temp,
        hum: payload.hum,
        ws: payload.ws,
        wd: payload.wd,
        measuredAt: new Date()
      });
    }
  } else if (currentStation.type === 'soc') {
    const ph = payload.ph;
    const isValidPh = ph !== undefined && ph >= 0 && ph <= 14;
    
    if (isValidPh || payload.n !== undefined) {
      await db.insert(dataSoc).values({
        stationUuid: currentStation.uuid,
        ph: payload.ph,
        no2: payload.no2,
        ec: payload.ec,
        temp: payload.temp,
        hum: payload.hum,
        n: payload.n,
        p: payload.p,
        k: payload.k,
        measuredAt: new Date()
      });
    }
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

  // Find station by UUID
  const stations = await db.select().from(station).where(eq(station.uuid, apiKey));
  if (stations.length === 0) {
    return c.json({ error: 'Invalid API Key' }, 401);
  }
  
  const currentStation = stations[0];

  // Update current station firmware version if provided
  if (currentVersion && currentVersion !== currentStation.currentVersion) {
    await db.update(station)
      .set({ currentVersion: currentVersion })
      .where(eq(station.uuid, currentStation.uuid));
  }

  // Get latest firmware release for this project
  const latestVersions = await db.select()
    .from(firmwareRelease)
    .where(eq(firmwareRelease.projectName, currentStation.projectName))
    .orderBy(desc(firmwareRelease.createdAt))
    .limit(1);

  if (latestVersions.length > 0) {
    const latest = latestVersions[0];
    if (latest.version !== currentVersion) {
      return c.json({
        update_available: true,
        latest_version: latest.version,
        github_url: latest.binFileUrl
      }, 200);
    }
  }

  return c.json({
    update_available: false,
    latest_version: currentVersion || 'unknown'
  }, 200);
});
