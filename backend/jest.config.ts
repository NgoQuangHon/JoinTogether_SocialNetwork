import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  setupFiles: ["<rootDir>/tests/setupEnv.ts"],
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

export default config;
