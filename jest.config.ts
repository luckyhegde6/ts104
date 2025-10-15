export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  setupFilesAfterEnv: ['./tests/setupTests.ts'],
  coverageReporters: ['json', 'text', 'lcov', 'cobertura'],
  coverageDirectory: 'coverage',
  // coverageThreshold: {
  //   global: {
  //     branches: 80,
  //     functions: 90,
  //     lines: 90,
  //     statements: 90
  //   }
  // }
};
