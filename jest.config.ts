/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

export default {
  // Stop running tests after `n` failures
  bail: true,

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // A list of paths to directories that Jest should use to search for files in
  roots: [
    "./tests"
  ],

  // The test environment that will be used for testing
  testEnvironment: "node",

  // Whether to use watchman for file crawling
  watchman: true,
};
