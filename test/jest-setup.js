const { configureToMatchImageSnapshot } = require('jest-image-snapshot');
const waitForExpect = require('wait-for-expect');

const customConfig = {
  comparisonMethod: 'ssim',
};
const toMatchImageSnapshot = configureToMatchImageSnapshot({
  customDiffConfig: customConfig,
  // noColors: true,
});

expect.extend({ toMatchImageSnapshot });

global.waitForExpect = waitForExpect;
