import { BrowserContextOptions, defineConfig, devices, LaunchOptions } from '@playwright/test';

import { LAUNCH_MODE } from './e2e/config';

interface BrowserConfig {
  appUrl: string;
  browserOptions: LaunchOptions;
  contextOptions: BrowserContextOptions;
}

let commonChromiumArgs = ['--allow-insecure-localhost', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']

let chromiumArguments = ['--allow-insecure-localhost', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--window-size=1024,768'];
let chromiumArgumentsCI = [
  '--allow-insecure-localhost', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream',
	'--headless',
	'--no-sandbox',
	'--disable-gpu',
	'--disable-popup-blocking',
	'--no-first-run',
	'--no-default-browser-check',
	'--disable-dev-shm-usage',
	'--disable-background-networking',
	'--disable-default-apps'
];



export const OpenViduCallConfig: BrowserConfig = {
  appUrl: LAUNCH_MODE === 'CI' ? 'http://localhost:5000/#/' : 'http://localhost:4200/#/',
  browserOptions: {args: LAUNCH_MODE === 'CI' ? chromiumArgumentsCI : chromiumArguments },
  contextOptions: {permissions: ["camera", "microphone"]},
};

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  testIgnore: "utils.po.spec.ts",
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: OpenViduCallConfig.appUrl,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], ignoreHTTPSErrors: true }
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'ng serve',
    // url: OpenViduCallConfig.appUrl,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
