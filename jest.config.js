module.exports = {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: ['src/**/*.{js,ts}', '!src/**/*.d.ts'],
  testMatch: ['<rootDir>/src/**/*.test.{js,ts}'],
  testEnvironment: 'node',
  preset: 'ts-jest',
  modulePaths: [],
  modulePathIgnorePatterns: ['approx'],
  moduleFileExtensions: ['web.js', 'js', 'web.ts', 'ts', 'web.tsx', 'tsx', 'json', 'web.jsx', 'jsx', 'node'],
  moduleNameMapper: {
    '<root>/src/approx/constant.ts': '<root>/src/approx/__mocks__/constant.ts',
  },
  resetMocks: true,
  setupFiles: ['./setupTests.ts'],
};
