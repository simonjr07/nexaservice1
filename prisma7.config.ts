import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Validation and client generation do not need a running database.
  // Migration commands require DATABASE_URL to be set.
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
