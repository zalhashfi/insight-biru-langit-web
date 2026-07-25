import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import * as schema from './src/db/schema.js';

const connection = await mysql.createConnection(process.env.DATABASE_URL!);
const db = drizzle(connection, { schema, mode: 'default' });

async function insertStation() {
  const stationId = crypto.randomUUID();
  const apiKey = crypto.randomUUID();

  await db.insert(schema.station).values({
    id: stationId,
    name: 'Stasiun Uji Coba',
    location: 'Lab',
    apiKey: apiKey,
    firmwareVersion: '2.0.0',
  });

  console.log(`Station inserted successfully!`);
  console.log(`Station ID: ${stationId}`);
  console.log(`API_KEY: ${apiKey}`);

  await connection.end();
}

insertStation().catch(console.error);
