module.exports = {
  preset: 'jest-playwright-preset',
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/test/jest-setup.js'],
};
