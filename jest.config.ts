import { createDefaultEsmPreset, type JestConfigWithTsJest } from "ts-jest";

const preset = createDefaultEsmPreset({
  // A separate TypeScript configuration file for Jest.
  tsconfig: "./tsconfig.jest.json",
});

const jestConfig: JestConfigWithTsJest = {
  ...preset,
  moduleNameMapper: {
    "^@/components/(.*)$": "<rootDir>/src/layouts/components/$1",
    "^@/shortcodes/(.*)$": "<rootDir>/src/layouts/shortcodes/$1",
    "^@/helpers/(.*)$": "<rootDir>/src/layouts/helpers/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default jestConfig;
