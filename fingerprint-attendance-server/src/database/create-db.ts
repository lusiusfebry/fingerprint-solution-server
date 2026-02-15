import { Client } from 'pg';
import { config } from 'dotenv';
config();

async function createDatabase() {
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  const client: any = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres', // Connect to default database
  });

  try {
    await client.connect();
    const dbName = process.env.DB_DATABASE || 'fingerprint_attendance';

    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`,
    );
    if (res.rowCount === 0) {
      console.log(`Creating database ${dbName}...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database ${dbName} created successfully.`);
    } else {
      console.log(`Database ${dbName} already exists.`);
    }
  } catch (err) {
    console.error('Error creating database:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase().catch((err) => {
  console.error('Error executing createDatabase:', err);
  process.exit(1);
});
