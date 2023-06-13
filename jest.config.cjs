/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  // TODO: still slow af, move away from ts-jest asap
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        isolatedModules: true,
      },
    ],
  },
};
