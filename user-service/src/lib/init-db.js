import prisma from "./prisma.js";
import bcrypt from "bcryptjs";

export async function initializeDatabase() {
  try {
    // Try a simple query to check if the schema exists
    await prisma.$queryRaw`SELECT 1 FROM "users" LIMIT 1`;
    console.log("Database schema already exists");
  } catch (error) {
    if (error.meta.code === "42P01") {
      // Table does not exist
      console.log("Initializing database schema...");
      try {
        // Use prisma db push programmatically
        const { execSync } = await import("child_process");
        execSync("npx prisma db push --skip-generate", {
          stdio: "inherit",
        });
        console.log("Database schema initialized successfully");

        // Create admin user if it doesn't exist
        const adminExists = await prisma.user.findFirst({
          where: { role: "ADMIN" },
        });

        if (!adminExists) {
          await prisma.user.create({
            data: {
              email: "admin@admin.com",
              password: await bcrypt.hash("adminadmin", 10),
              firstName: "Admin",
              lastName: "User",
              role: "ADMIN",
            },
          });
          console.log("Admin user created successfully");
        }
      } catch (pushError) {
        console.error("Failed to initialize database:", pushError);
        throw pushError;
      }
    } else {
      console.error("Database connection error:", error);
      throw error;
    }
  }
}