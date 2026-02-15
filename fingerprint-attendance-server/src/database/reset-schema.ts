import typeormConfig from '../config/typeorm.config';

async function dropSchema() {
  const dataSource = await typeormConfig.initialize();
  await dataSource.dropDatabase();
  // Since dropDatabase actually drops the potential database which might not be what we want if we just want to clear schema.
  // But typeormConfig is connected to specific DB.
  // Better approach for safe schema drop without dropping DB itself (if user lacks permission) is synchronize(true) then false or query.
  // But standard typeorm schema:drop is `typeorm schema:drop`. Let's just use that via CLI if possible or raw query.
  // Actually, let's just use raw query to drop public schema cascade.

  await dataSource.query('DROP SCHEMA public CASCADE');
  await dataSource.query('CREATE SCHEMA public');

  console.log('Schema dropped and recreated.');
  await dataSource.destroy();
}

dropSchema().catch(console.error);
