module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.spec.ts'],
  // Skip any specs that happen to sit inside a sibling git worktree checked
  // out under `.worktrees/` — jest's testMatch is filesystem-wide and would
  // otherwise try to run them against this branch's tsconfig.
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/.worktrees/'],
  coverageReporters: ['json', 'lcov', 'text']
};
