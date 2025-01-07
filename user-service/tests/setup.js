import { beforeAll, afterAll, afterEach } from "vitest";
import prisma from "../src/lib/prisma.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load test environment variables
dotenv.config({
  path: path.join(__dirname, "..", ".env.test"),
});


beforeAll(async () => {
  // Ensure test environmentg
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Tests must be run in test environment!");
  }

  const currentDatabase = await prisma.$queryRaw`SELECT current_database()`;

  // Push schema to test database
  const { execSync } = await import("child_process");
  // execSync("npx prisma db push --force-reset --schema=prisma/schema.prisma", {
  //   env: {
  //     ...process.env,
  //     DATABASE_URL:
  //       process.env.DATABASE_URL_TEST ||
  //       "postgresql://postgres:postgres@localhost:5432/transport_user_test",
  //   },
  // });
  // execSync("npx prisma migrate reset --force --schema=prisma/schema.prisma", {
  // execSync("npx prisma db execute --command \"DROP SCHEMA public CASCADE; CREATE SCHEMA public;\"", {
  //   env: {
  //     ...process.env,
  //     DATABASE_URL:
  //       process.env.DATABASE_URL_TEST ||
  //       "postgresql://postgres:postgres@localhost:5432/transport_user_test",
  //   },
  // });

  // await prisma.$executeRaw`DROP SCHEMA public CASCADE;`;
  // await prisma.$executeRaw`CREATE SCHEMA public;`;

  //   const types = await prisma.$queryRaw`SELECT typname FROM pg_type WHERE typnamespace = 'public'::regnamespace;`;
  //   // Drop each type
  //   for (const type of types) {
  //     await prisma.$executeRaw`DROP TYPE IF EXISTS \`${type.typname}\` CASCADE;`;
  //     console.log(`Dropped type: ${type.typname}`);
  //   }


  // execSync("npx prisma db push --schema=prisma/schema.prisma", {
  //   env: {
  //     ...process.env,
  //     DATABASE_URL:
  //       process.env.DATABASE_URL_TEST ||
  //       "postgresql://postgres:postgres@localhost:5432/transport_user_test",
  //   },
  // });

});

afterEach(async () => {
  // Clear all tables after each test
  const tables = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  for (const { tablename } of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
  }
});

afterAll(async () => {
  // Drop all tables after tests
  // const tables = await prisma.$queryRaw`
  //   SELECT tablename FROM pg_tables WHERE schemaname='public'
  // `;

  // for (const { tablename } of tables) {
  //   await prisma.$executeRawUnsafe(
  //     `DROP TABLE IF EXISTS "${tablename}" CASCADE;`
  //   );
  // }

    const tables = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

    for (const { tablename } of tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
    }


  //     const types =
  //       await prisma.$queryRaw`SELECT typname FROM pg_type WHERE typnamespace = 'public'::regnamespace;`;
  //     // Drop each type
  //     for (const type of types) {
  //       await prisma.$executeRaw`DROP TYPE IF EXISTS \`${type.typname}\` CASCADE;`;
  //       console.log(`Dropped type: ${type.typname}`);
  //     }


  await prisma.$disconnect();
});
