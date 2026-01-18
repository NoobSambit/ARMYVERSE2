const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  collectCoverage: true,
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    'lib/game/**/*.{ts,tsx}',
    '!**/index.ts',
    '!**/types.ts',
  ],
  // Only run tests from test directory
  testMatch: ['<rootDir>/test/**/*.test.{ts,tsx}'],
}

module.exports = createJestConfig(customJestConfig)