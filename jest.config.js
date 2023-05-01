/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/modules/$1",
    "@utils/(.*)": "<rootDir>/src/utils/$1",
    "@pages/(.*)": "<rootDir>/src/pages/$1"
  },
};

