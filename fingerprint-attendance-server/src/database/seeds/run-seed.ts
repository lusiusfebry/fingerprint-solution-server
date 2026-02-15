import typeormConfig from '../../config/typeorm.config';
import { seedRoles } from './roles.seed';
import { seedUsers } from './users.seed';
import { ShiftsSeed } from './shifts.seed';

async function runSeeds() {
  const dataSource = await typeormConfig.initialize();

  console.log('Seeding roles...');
  await seedRoles(dataSource);

  console.log('Seeding users...');
  await seedUsers(dataSource);

  console.log('Seeding shifts...');
  await new ShiftsSeed().run(dataSource);

  console.log('Seeding completed!');

  await dataSource.destroy();
}

runSeeds().catch(console.error);
