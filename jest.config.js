module.exports = {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts'],
  testMatch: ['<rootDir>/src/**/*.{spec,test}.{js,ts}'],
  testEnvironment: 'node',
  preset: 'ts-jest',
  modulePaths: [],
  moduleFileExtensions: ['web.js', 'js', 'web.ts', 'ts', 'web.tsx', 'tsx', 'json', 'web.jsx', 'jsx', 'node'],
  moduleNameMapper: {
    '<root>/src/approx/constant.ts': '<root>/src/approx/__mocks__/constant.ts',
  },
  resetMocks: true,
  setupFiles: ['./setupTests.ts'],
  globals: {
    'ts-jest': {
      isolatedModules: true, // disable type checking
    },
  },
};
