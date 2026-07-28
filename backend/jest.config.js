"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.ts"],
    setupFiles: ["<rootDir>/tests/setupEnv.ts"],
    verbose: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
};
exports.default = config;
//# sourceMappingURL=jest.config.js.map