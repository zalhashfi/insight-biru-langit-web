import { mysqlTable, varchar, int, timestamp, text, json, boolean, mysqlEnum } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(), // UUID
  username: varchar('username', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['admin', 'engineer', 'user', 'non-login']).default('non-login').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});

export const station = mysqlTable('station', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }),
  apiKey: varchar('api_key', { length: 255 }).notNull().unique(),
  macAddress: varchar('mac_address', { length: 17 }).unique(),
  firmwareVersion: varchar('firmware_version', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});

export const rawSensorLog = mysqlTable('raw_sensor_log', {
  id: int('id').primaryKey().autoincrement(),
  stationIdRaw: varchar('station_id_raw', { length: 255 }), // Can be string identifier from device before validation
  pm25: int('pm25'),
  humidity: int('humidity'),
  temperature: int('temperature'),
  rawPayload: json('raw_payload'),
  status: mysqlEnum('status', ['pending', 'processed', 'failed']).default('pending').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull()
});

export const telemetryData = mysqlTable('telemetry_data', {
  id: int('id').primaryKey().autoincrement(),
  stationId: varchar('station_id', { length: 36 }).references(() => station.id),
  pm25: int('pm25'),
  humidity: int('humidity'),
  temperature: int('temperature'),
  isValid: boolean('is_valid').default(true),
  recordedAt: timestamp('recorded_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const firmwareVersion = mysqlTable('firmware_version', {
  id: int('id').primaryKey().autoincrement(),
  versionTag: varchar('version_tag', { length: 50 }).notNull().unique(),
  githubUrl: varchar('github_url', { length: 500 }).notNull(),
  releaseNotes: text('release_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const maintenanceTicket = mysqlTable('maintenance_ticket', {
  id: int('id').primaryKey().autoincrement(),
  stationId: varchar('station_id', { length: 36 }).references(() => station.id).notNull(),
  engineerId: varchar('engineer_id', { length: 36 }).references(() => users.id),
  status: mysqlEnum('status', ['open', 'in_progress', 'resolved', 'closed']).default('open').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});

export const maintenanceLog = mysqlTable('maintenance_log', {
  id: int('id').primaryKey().autoincrement(),
  ticketId: int('ticket_id').references(() => maintenanceTicket.id).notNull(),
  actionTaken: text('action_taken').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull()
});
