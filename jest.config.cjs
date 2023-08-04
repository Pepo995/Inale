/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  modulePathIgnorePatterns: ["node_modules", "jest-test-results.json"],
  moduleNameMapper: {
    "~/(.*)$": "<rootDir>/src/$1",
    "^@utils": "<rootDir>/src/utils",
    "^@constants": "<rootDir>/src/utils/constants",
    "^@types": "<rootDir>/src/types",
    "^@hooks": "<rootDir>/src/hooks",
    "^@atoms/(.*)$": "<rootDir>/src/components/atoms/$1",
    "^@molecules/(.*)$": "<rootDir>/src/components/molecules/$1",
    "^@organisms/(.*)$": "<rootDir>/src/components/organisms/$1",
    "^@templates/(.*)$": "<rootDir>/src/components/templates/$1",
    "^@pages/(.*)$": "<rootDir>/src/components/pages/$1",
    "^@context": "<rootDir>/src/context",
    "^@controllers/(.*)$": "<rootDir>/src/server/controllers/$1",
    "^@api/(.*)$": "<rootDir>/src/server/api/$1",
    "^@infrastructure/(.*)$": "<rootDir>/src/server/infrastructure/$1",
    "^@db": "<rootDir>/src/server/db",
    "^@schemas": "<rootDir>/src/types/schemas",
    "^@errors": "<rootDir>/src/server/errors",
  },
};
