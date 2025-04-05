module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/*.spec.ts'],
    moduleNameMapper: {
      '^src/(.*)$': '<rootDir>/src/$1', // Fix: Use <rootDir> for absolute path resolution
    },
  };