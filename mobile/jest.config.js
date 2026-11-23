module.exports = {
  preset: "react-native",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  // Enforce the repo-wide 85% coverage target (#1759) for the mobile package.
  coverageProvider: "babel",
  coverageThreshold: {
    global: {
      lines: 85,
      functions: 85,
      branches: 85,
      statements: 85,
    },
  },
  // Transform ESM packages: react-native core modules AND msw (and its deps)
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@react-navigation|msw|@mswjs)",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/fixtures/"],
  // Route integration tests to their own testEnvironment so they don't try
  // to use a jsdom/react-native DOM environment when running plain Node.js
  // HTTP interceptor tests.
  projects: [
    {
      // Unit / smoke tests (React Native components, store, etc.)
      displayName: "unit",
      preset: "react-native",
      moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
      transformIgnorePatterns: [
        "node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@react-navigation|msw|@mswjs)",
      ],
      testPathIgnorePatterns: ["/node_modules/", "/fixtures/", "\\.integration\\.test\\."],
    },
    {
      // Integration tests for the API layer (Node.js / MSW)
      displayName: "integration",
      testEnvironment: "node",
      moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
      transform: {
        "^.+\\.(ts|tsx)$": "babel-jest",
      },
      transformIgnorePatterns: ["node_modules/(?!(msw|@mswjs))"],
      testMatch: ["**/*.integration.test.ts"],
      testPathIgnorePatterns: ["/node_modules/", "/fixtures/"],
    },
  ],
};
