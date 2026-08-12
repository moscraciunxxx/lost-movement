import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "overture-engine",
    include: ["tests/**/*.test.ts"],
    environment: "node",
    restoreMocks: true,
  },
});
