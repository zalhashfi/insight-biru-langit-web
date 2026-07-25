import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  console.log('Connected to DB');

  try {
    // Drop old tables to make way for the new ones
    console.log('Dropping old tables...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Attempt to drop any old tables
    const tablesToDrop = [
      'telemetry_data', 'firmware_version', 'maintenance_ticket',
      'data_log', 'data_aqms', 'data_soc', 'firmware_release', 
      'maintenance_log', 'maintenance_tickets', 'raw_sensor_log', 
      'station', 'users'
    ];
    for (const table of tablesToDrop) {
      await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
      console.log(`Dropped ${table}`);
    }

    // Read the generated SQL file
    const sqlPath = path.join(process.cwd(), 'drizzle', '0000_kind_speedball.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    const statements = sqlContent.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
    
    console.log(`Executing ${statements.length} statements...`);
    for (const statement of statements) {
      await connection.query(statement);
    }
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
