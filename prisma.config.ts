import { defineConfig, env } from "@prisma/config";

try {
  process.loadEnvFile();
} catch (e) {}

export default defineConfig({
  datasource: {
    url: env("DATABASE_URL"),
  },
});
