import prisma from './prisma.js';

export async function initializeDatabase() {
  try {
    // Try a simple query to check if the schema exists
    await prisma.$queryRaw`SELECT 1 FROM "routes" LIMIT 1`;
    console.log('Database schema already exists');
  } catch (error) {
    if (error.meta.code === '42P01') { // Table does not exist
      console.log('Initializing database schema...');
      try {
        const { execSync } = await import('child_process');
        execSync('npx prisma db push --skip-generate', {
          stdio: 'inherit'
        });
        console.log('Database schema initialized successfully');
      } catch (pushError) {
        console.error('Failed to initialize database:', pushError);
        throw pushError;
      }
    } else {
      console.error('Database connection error:', error);
      throw error;
    }
  }
}