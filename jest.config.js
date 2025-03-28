module.exports = {
  transform: {
    '^.+\\.tsx?$': ['@swc/jest', { jsc: { transform: { react: { runtime: 'automatic' } } } }],
  },
  coverageProvider: 'v8',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  collectCoverageFrom: ['<rootDir>/src/**/*', '!<rootDir>/src/bin.ts'],
  coverageThreshold: { global: { branches: 100, functions: 100, lines: 100, statements: 100 } },
}
