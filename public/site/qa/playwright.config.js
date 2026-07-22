
const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: '.', timeout: 30000, fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  reporter: [['html',{outputFolder:'report',open:'never'}],['list']],
});
