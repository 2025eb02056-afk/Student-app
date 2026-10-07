import { initializeDatabase, runMigrationsAndSeed } from './index.js';

async function runSeed() {
  console.log('🌱 Running standalone database migrations and seed script...');
  const db = await initializeDatabase();
  await runMigrationsAndSeed(db);
  console.log('✅ Seed completed successfully.');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('Seed runner failed:', err);
  process.exit(1);
});
